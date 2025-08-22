import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

// Função para mapear o plano baseado nos metadados
function mapPlanFromMetadata(
  metadata: any,
): "basico" | "profissional" | "avancado" | null {
  const plan = metadata?.plan;

  if (plan === "basico") return "basico";
  if (plan === "professional") return "profissional";
  if (plan === "advanced") return "avancado";

  // Fallback - tentar mapear pelo price ID se o plano não estiver nos metadados
  return "basico"; // Default fallback
}

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe secret key not found");
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Stripe signature not found");
  }
  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });
  const event = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      if (session.mode !== "subscription") {
        console.log("Checkout session not for subscription, skipping");
        break;
      }

      if (!session.subscription) {
        throw new Error("Subscription ID not found in checkout session");
      }

      // Buscar a subscription para obter os metadados
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription,
      );

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const userId = subscription.metadata?.userId;
      if (!userId) {
        throw new Error("User ID not found in subscription metadata");
      }

      // Mapear o plano correto baseado nos metadados
      const userPlan = mapPlanFromMetadata(subscription.metadata);

      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer,
          plan: userPlan,
        })
        .where(eq(usersTable.id, userId));

      console.log(`User ${userId} subscription activated: ${subscription.id}`);
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as any;

      // Verificar se é uma invoice de subscription
      if (!invoice.subscription) {
        console.log("Invoice not related to subscription, skipping");
        break;
      }

      // Buscar a subscription para obter os metadados
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription,
      );

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const userId = subscription.metadata?.userId;
      if (!userId) {
        console.log("User ID not found in subscription metadata, skipping");
        break;
      }

      // Mapear o plano correto baseado nos metadados
      const userPlan = mapPlanFromMetadata(subscription.metadata);

      // Atualizar o status da assinatura (para renovações)
      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: invoice.customer,
          plan: userPlan,
        })
        .where(eq(usersTable.id, userId));

      console.log(`User ${userId} subscription renewed: ${subscription.id}`);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;

      if (!subscription.id) {
        throw new Error("Subscription ID not found");
      }

      const userId = subscription.metadata?.userId;
      if (!userId) {
        console.log("User ID not found in subscription metadata, skipping");
        break;
      }

      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          plan: null,
        })
        .where(eq(usersTable.id, userId));

      console.log(`User ${userId} subscription cancelled: ${subscription.id}`);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as any;

      // Verificar se é uma invoice de subscription
      if (!invoice.subscription) {
        console.log("Invoice not related to subscription, skipping");
        break;
      }

      // Buscar a subscription para obter os metadados
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription,
      );

      if (!subscription) {
        throw new Error("Subscription not found");
      }

      const userId = subscription.metadata?.userId;
      if (!userId) {
        console.log("User ID not found in subscription metadata, skipping");
        break;
      }

      console.log(
        `Payment failed for user ${userId}. Attempt: ${invoice.attempt_count}`,
      );

      // Se é a terceira tentativa falhada (Stripe tenta 3 vezes por padrão)
      if (invoice.attempt_count >= 3) {
        console.log(
          `Final payment attempt failed for user ${userId}. Subscription will be cancelled.`,
        );
        // O Stripe automaticamente cancelará a subscription após 3 falhas
        // O webhook "customer.subscription.deleted" será chamado
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as any;

      if (!subscription.id) {
        throw new Error("Subscription ID not found");
      }

      const userId = subscription.metadata?.userId;
      if (!userId) {
        console.log("User ID not found in subscription metadata, skipping");
        break;
      }

      // Verificar se a subscription foi marcada para cancelamento
      if (subscription.cancel_at_period_end) {
        console.log(
          `Subscription for user ${userId} scheduled for cancellation at period end: ${new Date(subscription.current_period_end * 1000).toISOString()}`,
        );
      }

      // Verificar se a subscription foi reativada
      if (
        !subscription.cancel_at_period_end &&
        subscription.status === "active"
      ) {
        const userPlan = mapPlanFromMetadata(subscription.metadata);

        await db
          .update(usersTable)
          .set({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            plan: userPlan,
          })
          .where(eq(usersTable.id, userId));

        console.log(`Subscription reactivated for user ${userId}`);
      }
      break;
    }
  }
  return NextResponse.json({
    received: true,
  });
};

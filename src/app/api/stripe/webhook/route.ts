import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

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

      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: session.customer,
          plan: "basico",
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

      // Atualizar o status da assinatura (para renovações)
      await db
        .update(usersTable)
        .set({
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: invoice.customer,
          plan: "basico",
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
  }
  return NextResponse.json({
    received: true,
  });
};

"use server";

import { eq, isNotNull, and, inArray } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable } from "@/db/schema";

/**
 * Script para verificar e processar assinaturas expiradas
 * Deve ser executado periodicamente (ex: via cron job)
 */
export async function processExpiredSubscriptions() {
  console.log("🔍 Iniciando verificação de assinaturas expiradas...");

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not found");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });

    // Buscar usuários com planos pagos que têm subscriptionId
    const usersWithActivePlans = await db.query.usersTable.findMany({
      where: and(
        isNotNull(usersTable.stripeSubscriptionId),
        // Incluir apenas usuários com planos pagos
        inArray(usersTable.plan, ["basico", "profissional", "avancado"]),
      ),
    });

    console.log(
      `📊 Encontrados ${usersWithActivePlans.length} usuários com planos pagos`,
    );

    for (const user of usersWithActivePlans) {
      if (!user.stripeSubscriptionId) {
        continue;
      }

      try {
        // Verificar status da subscription no Stripe
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId,
        );

        console.log(
          `👤 Verificando usuário ${user.id} - Subscription: ${subscription.status}`,
        );

        // Se a subscription não está ativa
        if (
          subscription.status !== "active" &&
          subscription.status !== "trialing"
        ) {
          console.log(
            `⚠️ Subscription inativa detectada para usuário ${user.id}. Status: ${subscription.status}`,
          );

          // Remover o plano e limpar dados do Stripe
          await db
            .update(usersTable)
            .set({
              plan: null,
              stripeSubscriptionId: null,
              stripeCustomerId: null,
            })
            .where(eq(usersTable.id, user.id));

          console.log(`✅ Plano removido para usuário ${user.id}`);
        }

        // Se a subscription está cancelada para o final do período
        if (
          (subscription as any).cancel_at_period_end &&
          (subscription as any).current_period_end
        ) {
          const endDate = new Date(
            (subscription as any).current_period_end * 1000,
          );
          console.log(
            `📅 Subscription do usuário ${user.id} será cancelada em: ${endDate.toISOString()}`,
          );

          // Se já passou da data de expiração
          if (new Date() > endDate) {
            await db
              .update(usersTable)
              .set({
                plan: null,
                stripeSubscriptionId: null,
                stripeCustomerId: null,
              })
              .where(eq(usersTable.id, user.id));

            console.log(`✅ Plano expirado removido para usuário ${user.id}`);
          }
        }
      } catch (subscriptionError: any) {
        // Se a subscription não existe mais no Stripe
        if (subscriptionError.code === "resource_missing") {
          console.log(
            `❌ Subscription não encontrada no Stripe para usuário ${user.id}. Removendo plano...`,
          );

          await db
            .update(usersTable)
            .set({
              plan: null,
              stripeSubscriptionId: null,
              stripeCustomerId: null,
            })
            .where(eq(usersTable.id, user.id));

          console.log(
            `✅ Plano removido para usuário ${user.id} (subscription não encontrada)`,
          );
        } else {
          console.error(
            `❌ Erro ao verificar subscription para usuário ${user.id}:`,
            subscriptionError.message,
          );
        }
      }

      // Pequeno delay para não sobrecarregar a API do Stripe
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("✅ Verificação de assinaturas expiradas concluída");
    return { success: true, processedUsers: usersWithActivePlans.length };
  } catch (error) {
    console.error("❌ Erro ao processar assinaturas expiradas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Verificar status de uma subscription específica
 */
export async function checkSubscriptionStatus(userId: string) {
  try {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user || !user.stripeSubscriptionId) {
      return { status: "no_subscription", plan: user?.plan || null };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not found");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-05-28.basil",
    });

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
    );

    return {
      status: subscription.status,
      plan: user.plan,
      currentPeriodEnd: (subscription as any).current_period_end
        ? new Date((subscription as any).current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end || false,
    };
  } catch (error) {
    console.error("Erro ao verificar status da subscription:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

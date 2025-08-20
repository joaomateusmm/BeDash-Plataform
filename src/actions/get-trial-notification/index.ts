import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getTrialStatus } from "@/helpers/trial";

export interface TrialNotification {
  show: boolean;
  type: "warning" | "danger" | "expired";
  title: string;
  message: string;
  daysRemaining: number;
  ctaText: string;
}

/**
 * Verifica se deve mostrar notificação sobre o trial
 */
export async function getTrialNotification(): Promise<TrialNotification> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        show: false,
        type: "warning",
        title: "",
        message: "",
        daysRemaining: 0,
        ctaText: "",
      };
    }

    const userData = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    if (!userData) {
      return {
        show: false,
        type: "warning",
        title: "",
        message: "",
        daysRemaining: 0,
        ctaText: "",
      };
    }

    const trialStatus = getTrialStatus(userData);

    // Se não está em trial, não mostra notificação
    if (!trialStatus.isActive && !trialStatus.isExpired) {
      return {
        show: false,
        type: "warning",
        title: "",
        message: "",
        daysRemaining: 0,
        ctaText: "",
      };
    }

    // Trial expirado
    if (trialStatus.isExpired) {
      return {
        show: true,
        type: "expired",
        title: "Trial Expirado",
        message:
          "Seu período de teste gratuito expirou. Faça upgrade para continuar usando todos os recursos.",
        daysRemaining: 0,
        ctaText: "Fazer Upgrade Agora",
      };
    }

    // Trial próximo do fim (3 dias ou menos)
    if (trialStatus.daysRemaining <= 3) {
      return {
        show: true,
        type: "danger",
        title: "Trial Terminando",
        message: `Seu trial expira em ${trialStatus.daysRemaining} ${trialStatus.daysRemaining === 1 ? "dia" : "dias"}. Não perca o acesso aos recursos premium!`,
        daysRemaining: trialStatus.daysRemaining,
        ctaText: "Fazer Upgrade",
      };
    }

    // Trial com aviso (5 dias ou menos)
    if (trialStatus.daysRemaining <= 5) {
      return {
        show: true,
        type: "warning",
        title: "Trial Terminando em Breve",
        message: `Você tem ${trialStatus.daysRemaining} dias restantes no seu trial gratuito. Considere fazer upgrade para continuar aproveitando todos os recursos.`,
        daysRemaining: trialStatus.daysRemaining,
        ctaText: "Ver Planos",
      };
    }

    // Trial ativo, sem necessidade de notificação
    return {
      show: false,
      type: "warning",
      title: "",
      message: "",
      daysRemaining: trialStatus.daysRemaining,
      ctaText: "",
    };
  } catch (error) {
    console.error("Erro ao verificar notificação de trial:", error);
    return {
      show: false,
      type: "warning",
      title: "",
      message: "",
      daysRemaining: 0,
      ctaText: "",
    };
  }
}

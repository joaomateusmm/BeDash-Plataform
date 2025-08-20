"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { actionClient } from "@/lib/next-safe-action";
import { z } from "zod";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { hasFullAccess } from "@/helpers/trial";

export interface AccessLevel {
  hasAccess: boolean;
  message?: string;
  isTrialUser: boolean;
  plan?: string | null;
}

const checkUserAccessSchema = z.object({});

/**
 * Verifica se o usuário tem acesso a recursos premium
 */
async function checkUserAccessHandler(): Promise<AccessLevel> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        hasAccess: false,
        message: "Usuário não autenticado",
        isTrialUser: false,
      };
    }

    const userData = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    if (!userData) {
      return {
        hasAccess: false,
        message: "Usuário não encontrado",
        isTrialUser: false,
      };
    }

    const hasAccess = hasFullAccess(userData);
    const isTrialUser = userData.plan === "basico_trial";

    return {
      hasAccess,
      message: hasAccess
        ? undefined
        : "Upgrade necessário para acessar este recurso",
      isTrialUser,
      plan: userData.plan,
    };
  } catch (error) {
    console.error("Erro ao verificar acesso:", error);
    return {
      hasAccess: false,
      message: "Erro interno do servidor",
      isTrialUser: false,
    };
  }
}

export const checkUserAccess = actionClient
  .schema(checkUserAccessSchema)
  .action(checkUserAccessHandler);

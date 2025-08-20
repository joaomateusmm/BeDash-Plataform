"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createTrialDates } from "@/helpers/trial";

/**
 * Configura o trial para um usuário, se necessário
 */
export async function setupUserTrial(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    const userData = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    // Se usuário já tem plano, não faz nada
    if (userData?.plan) {
      return false;
    }

    // Configurar trial para usuário novo
    const { trialStartDate, trialEndDate } = createTrialDates();

    await db
      .update(usersTable)
      .set({
        plan: "essential_trial",
        isInTrial: true,
        trialStartDate,
        trialEndDate,
      })
      .where(eq(usersTable.id, session.user.id));

    return true;
  } catch (error) {
    console.error("Erro ao configurar trial:", error);
    return false;
  }
}

"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createSafeActionClient } from "next-safe-action";

const deleteBusinessSchema = z.object({
  id: z.string().uuid(),
});

const actionClient = createSafeActionClient();

export const deleteBusiness = actionClient
  .schema(deleteBusinessSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    // Verificar se o usuário tem acesso a esta empresa
    const userHasAccess = await db
      .select()
      .from(usersToClinicsTable)
      .where(
        and(
          eq(usersToClinicsTable.userId, session.user.id),
          eq(usersToClinicsTable.clinicId, parsedInput.id),
        ),
      )
      .limit(1);

    if (userHasAccess.length === 0) {
      throw new Error("Você não tem permissão para excluir esta empresa");
    }

    // Primeiro, remover a associação do usuário
    await db
      .delete(usersToClinicsTable)
      .where(
        and(
          eq(usersToClinicsTable.userId, session.user.id),
          eq(usersToClinicsTable.clinicId, parsedInput.id),
        ),
      );

    // Depois, excluir a empresa (cascade vai cuidar das outras relações)
    await db.delete(clinicsTable).where(eq(clinicsTable.id, parsedInput.id));

    revalidatePath("/gerenciar");

    return { success: true };
  });

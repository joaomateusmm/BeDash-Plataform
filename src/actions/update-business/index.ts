"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createSafeActionClient } from "next-safe-action";

const updateBusinessSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Nome da empresa é obrigatório.",
    })
    .max(100, {
      message: "Nome da empresa deve ter no máximo 100 caracteres.",
    }),
});

const actionClient = createSafeActionClient();

export const updateBusiness = actionClient
  .schema(updateBusinessSchema)
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
      throw new Error("Você não tem permissão para editar esta empresa");
    }

    const [updatedBusiness] = await db
      .update(clinicsTable)
      .set({
        name: parsedInput.name,
        updatedAt: new Date(),
      })
      .where(eq(clinicsTable.id, parsedInput.id))
      .returning();

    // Revalidar as páginas que dependem dos dados da empresa
    revalidatePath(`/${parsedInput.id}/gerenciar`);
    revalidatePath(`/${parsedInput.id}/dashboard`);
    revalidatePath("/");

    return { success: true, business: updatedBusiness };
  });

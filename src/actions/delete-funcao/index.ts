"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { funcoesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { auth } from "@/lib/auth";
import { z } from "zod";

const deleteFuncaoSchema = z.object({
  id: z.string().uuid(),
});

export const deleteFuncaoAction = actionClient
  .schema(deleteFuncaoSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    const { id } = parsedInput;

    // Deletar função
    await db
      .delete(funcoesTable)
      .where(
        and(
          eq(funcoesTable.id, id),
          eq(funcoesTable.clinicId, session.user.clinic.id)
        )
      );

    revalidatePath("/funcoes");
    
    return {
      message: "Função excluída com sucesso!",
    };
  });

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { funcoesTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { auth } from "@/lib/auth";

import { upsertFuncaoSchema } from "./schema";

export const upsertFuncaoAction = actionClient
  .schema(upsertFuncaoSchema)
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

    const { id, name, description } = parsedInput;

    if (id) {
      // Atualizar função existente
      await db
        .update(funcoesTable)
        .set({
          name,
          description,
          updatedAt: new Date(),
        })
        .where(
          eq(funcoesTable.id, id)
        );
    } else {
      // Criar nova função
      await db.insert(funcoesTable).values({
        clinicId: session.user.clinic.id,
        name,
        description,
      });
    }

    revalidatePath("/funcoes");
    
    return {
      message: id ? "Função atualizada com sucesso!" : "Função criada com sucesso!",
    };
  });

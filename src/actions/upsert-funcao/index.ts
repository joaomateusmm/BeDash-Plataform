"use server";

import { eq, count } from "drizzle-orm";
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
      throw new Error("Empresa não encontrada");
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
        .where(eq(funcoesTable.id, id));
    } else {
      // Verificar limite de funções antes de criar uma nova
      const [currentCount] = await db
        .select({ count: count() })
        .from(funcoesTable)
        .where(eq(funcoesTable.clinicId, session.user.clinic.id));

      const maxFunctions = 10; // Limite do plano básico

      if (currentCount.count >= maxFunctions) {
        throw new Error(
          `Limite de ${maxFunctions} funções atingido. Faça upgrade do seu plano para adicionar mais funções.`,
        );
      }

      // Criar nova função
      await db.insert(funcoesTable).values({
        clinicId: session.user.clinic.id,
        name,
        description,
      });
    }

    revalidatePath("/funcoes");

    return {
      message: id
        ? "Função atualizada com sucesso!"
        : "Função criada com sucesso!",
    };
  });

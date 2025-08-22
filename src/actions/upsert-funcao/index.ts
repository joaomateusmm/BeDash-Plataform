"use server";

import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { funcoesTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { auth } from "@/lib/auth";
import { getPlanInfo } from "@/helpers/plan-info";

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
      // Buscar o plano do usuário
      const userData = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, session.user.id),
      });

      const userPlan = userData?.plan || "basico_trial";
      const planInfo = getPlanInfo(userPlan);

      const [currentCount] = await db
        .select({ count: count() })
        .from(funcoesTable)
        .where(eq(funcoesTable.clinicId, session.user.clinic.id));

      // Verificar se tem limite (não é ilimitado)
      if (typeof planInfo.limits.functions === "number") {
        const maxFunctions = planInfo.limits.functions;

        if (currentCount.count >= maxFunctions) {
          throw new Error(
            `Limite de ${maxFunctions} funções atingido para o plano ${planInfo.name}. Faça upgrade do seu plano para adicionar mais funções.`,
          );
        }
      }
      // Se for "unlimited", não faz verificação

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

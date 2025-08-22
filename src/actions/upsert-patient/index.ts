"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, count } from "drizzle-orm";

import { db } from "@/db";
import { clientesTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { getPlanInfo } from "@/helpers/plan-info";

import { upsertclienteschema } from "./schema";

export const upsertPatient = actionClient
  .schema(upsertclienteschema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Verificar limite de clientes antes de criar um novo
    if (!parsedInput.id) {
      // Buscar o plano do usuário
      const userData = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, session.user.id),
      });

      const userPlan = userData?.plan || "basico_trial";
      const planInfo = getPlanInfo(userPlan);

      const [currentCount] = await db
        .select({ count: count() })
        .from(clientesTable)
        .where(eq(clientesTable.clinicId, session.user.clinic.id));

      // Verificar se tem limite (não é ilimitado)
      if (typeof planInfo.limits.clients === "number") {
        const maxClients = planInfo.limits.clients;

        if (currentCount.count >= maxClients) {
          throw new Error(
            `Limite de ${maxClients} clientes atingido para o plano ${planInfo.name}. Faça upgrade do seu plano para adicionar mais clientes.`,
          );
        }
      }
      // Se for "unlimited", não faz verificação
    }

    await db
      .insert(clientesTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
      })
      .onConflictDoUpdate({
        target: [clientesTable.id],
        set: {
          ...parsedInput,
        },
      });
    revalidatePath("/clientes");
  });

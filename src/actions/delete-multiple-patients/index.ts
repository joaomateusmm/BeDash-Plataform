"use server";

import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db";
import { clientesTable } from "@/db/schema";

export const deleteMultiplePatients = actionClient
  .schema(
    z.object({
      ids: z
        .array(z.string().uuid())
        .min(1, "Selecione pelo menos um cliente para deletar"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.clinic?.id) {
      throw new Error("Usuário não autenticado ou clínica não encontrada");
    }

    const { ids } = parsedInput;

    try {
      // Verificar se todos os clientes pertencem à clínica do usuário
      const existingClients = await db.query.clientesTable.findMany({
        where: inArray(clientesTable.id, ids),
        columns: { id: true, clinicId: true },
      });

      const unauthorizedClients = existingClients.filter(
        (client) => client.clinicId !== session.user.clinic!.id,
      );

      if (unauthorizedClients.length > 0) {
        throw new Error("Você não tem permissão para deletar esses clientes");
      }

      if (existingClients.length !== ids.length) {
        throw new Error("Alguns clientes não foram encontrados");
      }

      // Deletar os clientes
      await db.delete(clientesTable).where(inArray(clientesTable.id, ids));

      revalidatePath("/[businessId]/clientes", "page");

      return {
        success: true,
        message: `${ids.length} cliente(s) deletado(s) com sucesso`,
      };
    } catch (error) {
      console.error("Erro ao deletar clientes:", error);
      throw new Error("Erro ao deletar clientes");
    }
  });

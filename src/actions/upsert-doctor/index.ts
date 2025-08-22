"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, count } from "drizzle-orm";

import { db } from "@/db";
import {
  profissionaisTable,
  profissionaisToFuncoesTable,
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { localTimeToUtc } from "@/helpers/timezone";
import { getPlanInfo } from "@/helpers/plan-info";

import { upsertprofissionaischema } from "./schema";

dayjs.extend(utc);

export const upsertDoctor = actionClient
  .schema(upsertprofissionaischema)
  .action(async ({ parsedInput }) => {
    const { funcoes, ...profissionalData } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Verificar limite de profissionais antes de criar um novo
    if (!profissionalData.id) {
      // Buscar o plano do usuário
      const userData = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, session.user.id),
      });

      const userPlan = userData?.plan || "basico_trial";
      const planInfo = getPlanInfo(userPlan);

      const [currentCount] = await db
        .select({ count: count() })
        .from(profissionaisTable)
        .where(eq(profissionaisTable.clinicId, session.user.clinic.id));

      // Verificar se tem limite (não é ilimitado)
      if (typeof planInfo.limits.professionals === "number") {
        const maxDoctors = planInfo.limits.professionals;

        if (currentCount.count >= maxDoctors) {
          throw new Error(
            `Limite de ${maxDoctors} profissionais atingido para o plano ${planInfo.name}. Faça upgrade do seu plano para adicionar mais profissionais.`,
          );
        }
      }
      // Se for "unlimited", não faz verificação
    }

    // Converter horários locais para UTC para salvar no banco
    const availableFromTimeUTC = localTimeToUtc(
      profissionalData.availableFromTime,
    );
    const availableToTimeUTC = localTimeToUtc(profissionalData.availableToTime);

    const profissionalDataToSave = {
      ...profissionalData,
      clinicId: session?.user.clinic?.id,
      availableFromTime: availableFromTimeUTC,
      availableToTime: availableToTimeUTC,
    };

    let profissionalId: string;

    if (profissionalData.id) {
      // Atualizar profissional existente
      await db
        .update(profissionaisTable)
        .set(profissionalDataToSave)
        .where(eq(profissionaisTable.id, profissionalData.id));

      profissionalId = profissionalData.id;

      // Remover funções existentes
      await db
        .delete(profissionaisToFuncoesTable)
        .where(eq(profissionaisToFuncoesTable.profissionalId, profissionalId));
    } else {
      // Criar novo profissional
      const [newProfissional] = await db
        .insert(profissionaisTable)
        .values(profissionalDataToSave)
        .returning({ id: profissionaisTable.id });

      profissionalId = newProfissional.id;
    }

    // Inserir novas funções
    if (funcoes.length > 0) {
      await db.insert(profissionaisToFuncoesTable).values(
        funcoes.map((funcaoId) => ({
          profissionalId,
          funcaoId,
        })),
      );
    }

    revalidatePath("/profissionais");
  });

import { z } from "zod";
import { eq, and, gte, lte, count } from "drizzle-orm";
import dayjs from "dayjs";

import { actionClient } from "@/lib/next-safe-action";
import { db } from "@/db";
import {
  clientesTable,
  profissionaisTable,
  appointmentsTable,
  funcoesTable,
  usersToClinicsTable,
} from "@/db/schema";
import { TrialUsageData, TrialUsageSchema } from "./schema";

const inputSchema = z.object({
  userId: z.string().min(1, "User ID é obrigatório"),
});

export const getTrialUsage = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput }): Promise<TrialUsageData> => {
    const { userId } = parsedInput;

    console.log("🔍 Buscando dados de uso para userId:", userId);

    // Buscar o clinicId do usuário
    const userBusiness = await db
      .select({ clinicId: usersToClinicsTable.clinicId })
      .from(usersToClinicsTable)
      .where(eq(usersToClinicsTable.userId, userId))
      .limit(1);

    const clinicId = userBusiness[0]?.clinicId;

    if (!clinicId) {
      console.log("❌ Nenhuma clínica encontrada para o usuário");
      return TrialUsageSchema.parse({
        currentClients: 0,
        currentDoctors: 0,
        currentAppointmentsThisMonth: 0,
        currentFunctions: 0,
      });
    }

    // Definir intervalo do mês atual
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

    try {
      console.log("🔍 Buscando dados de uso para clinicId:", clinicId);

      // Contar clientes
      const [clientsResult] = await db
        .select({ count: count() })
        .from(clientesTable)
        .where(eq(clientesTable.clinicId, clinicId));

      // Contar profissionais/médicos
      const [doctorsResult] = await db
        .select({ count: count() })
        .from(profissionaisTable)
        .where(eq(profissionaisTable.clinicId, clinicId));

      // Contar agendamentos deste mês
      const [appointmentsResult] = await db
        .select({ count: count() })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, clinicId),
            gte(appointmentsTable.date, startOfMonth),
            lte(appointmentsTable.date, endOfMonth),
          ),
        );

      // Contar funções
      const [functionsResult] = await db
        .select({ count: count() })
        .from(funcoesTable)
        .where(eq(funcoesTable.clinicId, clinicId));

      const result = TrialUsageSchema.parse({
        currentClients: clientsResult?.count || 0,
        currentDoctors: doctorsResult?.count || 0,
        currentAppointmentsThisMonth: appointmentsResult?.count || 0,
        currentFunctions: functionsResult?.count || 0,
        businessId: clinicId,
      });

      console.log("📊 Dados de uso carregados:", result);

      return result;
    } catch (error) {
      console.error("Erro ao buscar dados de uso:", error);
      return TrialUsageSchema.parse({
        currentClients: 0,
        currentDoctors: 0,
        currentAppointmentsThisMonth: 0,
        currentFunctions: 0,
        businessId: clinicId,
      });
    }
  });

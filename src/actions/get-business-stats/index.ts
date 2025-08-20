"use server";

import { headers } from "next/headers";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  clinicsTable,
  usersToClinicsTable,
  clientesTable,
  profissionaisTable,
  appointmentsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  businessId: z.string(),
});

export const getBusinessStats = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { businessId } }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    // Verificar se o usuário tem acesso a esta empresa
    const hasAccess = await db
      .select({ id: clinicsTable.id })
      .from(clinicsTable)
      .innerJoin(
        usersToClinicsTable,
        eq(clinicsTable.id, usersToClinicsTable.clinicId),
      )
      .where(
        and(
          eq(usersToClinicsTable.userId, session.user.id),
          eq(clinicsTable.id, businessId),
        ),
      )
      .limit(1);

    if (hasAccess.length === 0) {
      throw new Error("Acesso negado a esta empresa");
    }

    // Buscar dados da empresa
    const business = await db
      .select({
        id: clinicsTable.id,
        name: clinicsTable.name,
        createdAt: clinicsTable.createdAt,
        updatedAt: clinicsTable.updatedAt,
      })
      .from(clinicsTable)
      .where(eq(clinicsTable.id, businessId))
      .limit(1);

    if (business.length === 0) {
      throw new Error("Empresa não encontrada");
    }

    // Contar clientes desta empresa específica
    const clientesCount = await db
      .select({ count: count() })
      .from(clientesTable)
      .where(eq(clientesTable.clinicId, businessId))
      .then((result) => result[0]?.count || 0);

    // Contar profissionais desta empresa específica
    const profissionaisCount = await db
      .select({ count: count() })
      .from(profissionaisTable)
      .where(eq(profissionaisTable.clinicId, businessId))
      .then((result) => result[0]?.count || 0);

    // Contar agendamentos desta empresa específica
    const agendamentosCount = await db
      .select({ count: count() })
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, businessId))
      .then((result) => result[0]?.count || 0);

    // Calcular faturamento total desta empresa específica
    const totalRevenueResult = await db
      .select({
        total: appointmentsTable.priceInCents,
      })
      .from(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, businessId));

    const totalRevenue =
      totalRevenueResult.reduce(
        (sum, appointment) => sum + (appointment.total || 0),
        0,
      ) / 100; // Converter de cents para reais

    // Calcular faturamento do mês atual desta empresa específica
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueResult = await db
      .select({
        total: appointmentsTable.priceInCents,
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, businessId),
          // Filtrar por mês atual usando o campo date
        ),
      );

    const monthlyRevenue =
      monthlyRevenueResult.reduce(
        (sum, appointment) => sum + (appointment.total || 0),
        0,
      ) / 100;

    return {
      ...business[0],
      _count: {
        clientes: clientesCount,
        profissionais: profissionaisCount,
        agendamentos: agendamentosCount,
      },
      stats: {
        totalRevenue,
        monthlyRevenue,
        subscription: "Essential", // Por enquanto fixo, depois pode vir do banco
      },
    };
  });

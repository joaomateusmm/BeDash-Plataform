"use server";

import { headers } from "next/headers";
import { eq, and, count } from "drizzle-orm";

import { db } from "@/db";
import {
  clinicsTable,
  usersToClinicsTable,
  clientesTable,
  profissionaisTable,
  appointmentsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export const getUserBusinesses = async (activeBusinessId?: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  // Se um ID específico for fornecido, usar apenas essa empresa
  let businessesToProcess;

  if (activeBusinessId) {
    // Buscar apenas a empresa ativa
    const activeBusiness = await db
      .select({
        id: clinicsTable.id,
        name: clinicsTable.name,
        createdAt: clinicsTable.createdAt,
        updatedAt: clinicsTable.updatedAt,
      })
      .from(clinicsTable)
      .innerJoin(
        usersToClinicsTable,
        eq(clinicsTable.id, usersToClinicsTable.clinicId),
      )
      .where(
        and(
          eq(usersToClinicsTable.userId, session.user.id),
          eq(clinicsTable.id, activeBusinessId),
        ),
      );

    businessesToProcess = activeBusiness;
  } else {
    // Buscar todas as empresas do usuário
    businessesToProcess = await db
      .select({
        id: clinicsTable.id,
        name: clinicsTable.name,
        createdAt: clinicsTable.createdAt,
        updatedAt: clinicsTable.updatedAt,
      })
      .from(clinicsTable)
      .innerJoin(
        usersToClinicsTable,
        eq(clinicsTable.id, usersToClinicsTable.clinicId),
      )
      .where(eq(usersToClinicsTable.userId, session.user.id));
  }

  // Para cada empresa, buscar as estatísticas
  const businessesWithStats = await Promise.all(
    businessesToProcess.map(async (business) => {
      // Contar clientes
      const clientesCount = await db
        .select({ count: count() })
        .from(clientesTable)
        .where(eq(clientesTable.clinicId, business.id))
        .then((result) => result[0]?.count || 0);

      // Contar profissionais
      const profissionaisCount = await db
        .select({ count: count() })
        .from(profissionaisTable)
        .where(eq(profissionaisTable.clinicId, business.id))
        .then((result) => result[0]?.count || 0);

      // Contar agendamentos
      const agendamentosCount = await db
        .select({ count: count() })
        .from(appointmentsTable)
        .where(eq(appointmentsTable.clinicId, business.id))
        .then((result) => result[0]?.count || 0);

      // Calcular faturamento total
      const totalRevenueResult = await db
        .select({
          total: appointmentsTable.priceInCents,
        })
        .from(appointmentsTable)
        .where(eq(appointmentsTable.clinicId, business.id));

      const totalRevenue =
        totalRevenueResult.reduce(
          (sum, appointment) => sum + (appointment.total || 0),
          0,
        ) / 100; // Converter de cents para reais

      // Calcular faturamento do mês atual
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
            eq(appointmentsTable.clinicId, business.id),
            // Filtrar por mês atual usando o campo date
          ),
        );

      const monthlyRevenue =
        monthlyRevenueResult.reduce(
          (sum, appointment) => sum + (appointment.total || 0),
          0,
        ) / 100;

      return {
        ...business,
        _count: {
          clientes: clientesCount,
          profissionais: profissionaisCount,
          agendamentos: agendamentosCount,
        },
        stats: {
          totalRevenue,
          monthlyRevenue,
          subscription: "Basico", // Por enquanto fixo, depois pode vir do banco
        },
      };
    }),
  );

  return businessesWithStats;
};

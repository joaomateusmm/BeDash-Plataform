import dayjs from "dayjs";
import { and, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  profissionaisTable,
  clientesTable,
  funcoesTable,
  profissionaisToFuncoesTable,
} from "@/db/schema";

interface Params {
  from: string;
  to: string;
  clinicId: string;
}

export const getDashboard = async ({ from, to, clinicId }: Params) => {
  // Expandir o período do gráfico para incluir mais dados
  const chartStartDate = dayjs().subtract(30, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(30, "days").endOf("day").toDate();
  const [
    [totalRevenue],
    [totalAppointments],
    [totalclientes],
    [totalprofissionais],
    [totalfuncoes],
    topprofissionais,
    topFuncoes,
    topClientes,
    todayAppointments,
    dailyAppointmentsData,
    weeklyAppointmentsData,
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.priceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(clientesTable)
      .where(eq(clientesTable.clinicId, clinicId)),
    db
      .select({
        total: count(),
      })
      .from(profissionaisTable)
      .where(eq(profissionaisTable.clinicId, clinicId)),
    db
      .select({
        total: count(),
      })
      .from(funcoesTable)
      .where(eq(funcoesTable.clinicId, clinicId)),
    db
      .select({
        id: profissionaisTable.id,
        name: profissionaisTable.name,
        avatarImageUrl: profissionaisTable.avatarImageUrl,
        appointments: count(appointmentsTable.id),
      })
      .from(profissionaisTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.doctorId, profissionaisTable.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .where(eq(profissionaisTable.clinicId, clinicId))
      .groupBy(profissionaisTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
    db
      .select({
        funcao: funcoesTable.name,
        appointments: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(
        profissionaisTable,
        eq(appointmentsTable.doctorId, profissionaisTable.id),
      )
      .innerJoin(
        profissionaisToFuncoesTable,
        eq(profissionaisToFuncoesTable.profissionalId, profissionaisTable.id),
      )
      .innerJoin(
        funcoesTable,
        eq(funcoesTable.id, profissionaisToFuncoesTable.funcaoId),
      )
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .groupBy(funcoesTable.name)
      .orderBy(desc(count(appointmentsTable.id))),
    db
      .select({
        id: clientesTable.id,
        name: clientesTable.name,
        email: clientesTable.email,
        phoneNumber: clientesTable.phoneNumber,
        appointments: count(appointmentsTable.id),
      })
      .from(clientesTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.patientId, clientesTable.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .where(eq(clientesTable.clinicId, clinicId))
      .groupBy(clientesTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(15),
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, clinicId),
        gte(appointmentsTable.date, new Date()),
        lte(appointmentsTable.date, new Date()),
      ),
      with: {
        patient: true,
        doctor: true,
      },
    }),
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
        appointments: count(appointmentsTable.id),
        revenue:
          sql<number>`COALESCE(SUM(${appointmentsTable.priceInCents}), 0)`.as(
            "revenue",
          ),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate),
        ),
      )
      .groupBy(sql`DATE(${appointmentsTable.date})`)
      .orderBy(sql`DATE(${appointmentsTable.date})`),
    // Dados por dia da semana
    db
      .select({
        dayOfWeek: sql<number>`EXTRACT(DOW FROM ${appointmentsTable.date})`.as(
          "dayOfWeek",
        ), // 0=Domingo, 1=Segunda, etc.
        appointments: count(appointmentsTable.id),
        revenue:
          sql<number>`COALESCE(SUM(${appointmentsTable.priceInCents}), 0)`.as(
            "revenue",
          ),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, clinicId),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .groupBy(sql`EXTRACT(DOW FROM ${appointmentsTable.date})`)
      .orderBy(sql`EXTRACT(DOW FROM ${appointmentsTable.date})`),
  ]);
  return {
    totalRevenue,
    totalAppointments,
    totalclientes,
    totalprofissionais,
    totalfuncoes,
    topprofissionais,
    topFuncoes,
    topClientes,
    todayAppointments,
    dailyAppointmentsData,
    weeklyAppointmentsData,
  };
};

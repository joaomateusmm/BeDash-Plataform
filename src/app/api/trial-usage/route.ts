import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { headers } from "next/headers";
import dayjs from "dayjs";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import {
  clientesTable,
  profissionaisTable,
  appointmentsTable,
  funcoesTable,
  usersToClinicsTable,
} from "@/db/schema";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("🔍 Buscando dados de uso para userId:", session.user.id);

    // Buscar o clinicId do usuário
    const userBusiness = await db
      .select({ clinicId: usersToClinicsTable.clinicId })
      .from(usersToClinicsTable)
      .where(eq(usersToClinicsTable.userId, session.user.id))
      .limit(1);

    const clinicId = userBusiness[0]?.clinicId;

    if (!clinicId) {
      console.log("❌ Nenhuma clínica encontrada para o usuário");
      return NextResponse.json({
        currentClients: 0,
        currentDoctors: 0,
        currentAppointmentsThisMonth: 0,
        currentFunctions: 0,
      });
    }

    // Definir intervalo do mês atual
    const startOfMonth = dayjs().startOf("month").toDate();
    const endOfMonth = dayjs().endOf("month").toDate();

    console.log("🔍 Buscando dados de uso para clinicId:", clinicId);

    // Executar todas as consultas em paralelo
    const [clientsResult, doctorsResult, appointmentsResult, functionsResult] =
      await Promise.all([
        // Contar clientes
        db
          .select({ count: count() })
          .from(clientesTable)
          .where(eq(clientesTable.clinicId, clinicId)),

        // Contar profissionais/médicos
        db
          .select({ count: count() })
          .from(profissionaisTable)
          .where(eq(profissionaisTable.clinicId, clinicId)),

        // Contar agendamentos deste mês
        db
          .select({ count: count() })
          .from(appointmentsTable)
          .where(
            and(
              eq(appointmentsTable.clinicId, clinicId),
              gte(appointmentsTable.date, startOfMonth),
              lte(appointmentsTable.date, endOfMonth),
            ),
          ),

        // Contar funções
        db
          .select({ count: count() })
          .from(funcoesTable)
          .where(eq(funcoesTable.clinicId, clinicId)),
      ]);

    const result = {
      currentClients: clientsResult[0]?.count || 0,
      currentDoctors: doctorsResult[0]?.count || 0,
      currentAppointmentsThisMonth: appointmentsResult[0]?.count || 0,
      currentFunctions: functionsResult[0]?.count || 0,
      businessId: clinicId,
    };

    console.log("📊 Dados de uso carregados:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar dados de uso:", error);
    return NextResponse.json(
      {
        currentClients: 0,
        currentDoctors: 0,
        currentAppointmentsThisMonth: 0,
        currentFunctions: 0,
      },
      { status: 200 },
    );
  }
}

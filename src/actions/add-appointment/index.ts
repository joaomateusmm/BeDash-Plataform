"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, count, and, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { getPlanInfo } from "@/helpers/plan-info";

import { getAvailableTimes } from "../get-available-times";
import { addAppointmentSchema } from "./schema";

export const addAppointment = actionClient
  .schema(addAppointmentSchema)
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

    // Verificar limite de agendamentos do mês antes de criar um novo
    // Buscar o plano do usuário
    const userData = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    const userPlan = userData?.plan || "basico_trial";
    const planInfo = getPlanInfo(userPlan);

    // Verificar se tem limite (não é ilimitado)
    if (typeof planInfo.limits.appointments === "number") {
      const startOfMonth = dayjs().startOf("month").toDate();
      const endOfMonth = dayjs().endOf("month").toDate();

      const [currentCount] = await db
        .select({ count: count() })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, startOfMonth),
            lt(appointmentsTable.date, endOfMonth),
          ),
        );

      const maxAppointmentsPerMonth = planInfo.limits.appointments;

      if (currentCount.count >= maxAppointmentsPerMonth) {
        throw new Error(
          `Limite de ${maxAppointmentsPerMonth} agendamentos por mês atingido para o plano ${planInfo.name}. Faça upgrade do seu plano para adicionar mais agendamentos.`,
        );
      }
    }
    // Se for "unlimited", não faz verificação

    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
    });
    if (!availableTimes?.data) {
      throw new Error("No available times");
    }
    const isTimeAvailable = availableTimes.data?.some(
      (time) => time.value === parsedInput.time && time.available,
    );
    if (!isTimeAvailable) {
      throw new Error("Time not available");
    }
    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .toDate();

    await db.insert(appointmentsTable).values({
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      clinicId: session?.user.clinic?.id,
      date: appointmentDateTime,
      priceInCents: parsedInput.appointmentPriceInCents,
    });

    revalidatePath("/appointments");
    revalidatePath("/dashboard");
  });

"use server";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { getAvailableTimes } from "../get-available-times";
import { editAppointmentSchema } from "./schema";

export const editAppointment = actionClient
  .schema(editAppointmentSchema)
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

    // Verificar se o agendamento existe e pertence à clínica
    const existingAppointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
    });

    if (!existingAppointment) {
      throw new Error("Agendamento não encontrado");
    }

    if (existingAppointment.clinicId !== session.user.clinic.id) {
      throw new Error("Agendamento não pertence à esta clínica");
    }

    // Verificar disponibilidade do horário (excluindo o agendamento atual)
    const availableTimes = await getAvailableTimes({
      doctorId: parsedInput.doctorId,
      date: dayjs(parsedInput.date).format("YYYY-MM-DD"),
    });

    if (!availableTimes?.data) {
      throw new Error("Não há horários disponíveis");
    }

    const isTimeAvailable = availableTimes.data?.some(
      (time) => time.value === parsedInput.time && time.available,
    );

    // Se o horário não está disponível, verificar se é o mesmo agendamento
    if (!isTimeAvailable) {
      const appointmentDateTime = dayjs(parsedInput.date)
        .set("hour", parseInt(parsedInput.time.split(":")[0]))
        .set("minute", parseInt(parsedInput.time.split(":")[1]))
        .toDate();

      // Se não é o mesmo horário do agendamento atual, o horário não está disponível
      if (
        existingAppointment.date.getTime() !== appointmentDateTime.getTime()
      ) {
        throw new Error("Horário não disponível");
      }
    }

    const appointmentDateTime = dayjs(parsedInput.date)
      .set("hour", parseInt(parsedInput.time.split(":")[0]))
      .set("minute", parseInt(parsedInput.time.split(":")[1]))
      .toDate();

    await db
      .update(appointmentsTable)
      .set({
        patientId: parsedInput.patientId,
        doctorId: parsedInput.doctorId,
        date: appointmentDateTime,
        priceInCents: parsedInput.appointmentPriceInCents,
        updatedAt: new Date(),
      })
      .where(eq(appointmentsTable.id, parsedInput.id));

    revalidatePath("/appointments");
  });

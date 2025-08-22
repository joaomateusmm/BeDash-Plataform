import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";

import { db } from "@/db";
import { usersTable, usersToClinicsTable, clinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getUserSettings(userId: string) {
  // Buscar informações do usuário
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      emailVerified: usersTable.emailVerified,
      image: usersTable.image,
      plan: usersTable.plan,
      isInTrial: usersTable.isInTrial,
      trialStartDate: usersTable.trialStartDate,
      trialEndDate: usersTable.trialEndDate,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  // Buscar empresas do usuário
  const userClinics = await db
    .select({
      clinicId: clinicsTable.id,
      clinicName: clinicsTable.name,
      clinicCreatedAt: clinicsTable.createdAt,
    })
    .from(usersToClinicsTable)
    .innerJoin(clinicsTable, eq(usersToClinicsTable.clinicId, clinicsTable.id))
    .where(eq(usersToClinicsTable.userId, userId));

  return {
    user,
    clinics: userClinics,
  };
}

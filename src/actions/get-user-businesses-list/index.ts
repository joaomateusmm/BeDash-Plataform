"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const getUserBusinessesList = actionClient
  .schema(z.object({}))
  .action(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    // Buscar apenas as informações básicas das empresas do usuário
    const userBusinesses = await db
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

    return userBusinesses;
  });

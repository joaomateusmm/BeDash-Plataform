"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createSafeActionClient } from "next-safe-action";

const createBusinessSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Nome da empresa é obrigatório.",
    })
    .max(100, {
      message: "Nome da empresa deve ter no máximo 100 caracteres.",
    }),
});

const actionClient = createSafeActionClient();

export const createBusiness = actionClient
  .schema(createBusinessSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autorizado");
    }

    const [business] = await db
      .insert(clinicsTable)
      .values({
        name: parsedInput.name,
      })
      .returning();

    await db.insert(usersToClinicsTable).values({
      userId: session.user.id,
      clinicId: business.id,
    });

    revalidatePath("/gerenciar");

    return { success: true, business };
  });

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { clientesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertclienteschema } from "./schema";

export const upsertPatient = actionClient
  .schema(upsertclienteschema)
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

    await db
      .insert(clientesTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
      })
      .onConflictDoUpdate({
        target: [clientesTable.id],
        set: {
          ...parsedInput,
        },
      });
    revalidatePath("/clientes");
  });
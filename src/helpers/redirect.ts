"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function redirectAfterAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // Buscar quantas empresas o usuário possui
  const userBusinesses = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
    with: {
      clinic: true,
    },
  });

  // Se não tem nenhuma empresa, redireciona para criar
  if (userBusinesses.length === 0) {
    redirect("/clinic-form");
  }

  // Se tem pelo menos uma empresa, redireciona para o dashboard da primeira
  const firstBusiness = userBusinesses[0];
  redirect(`/${firstBusiness.clinic.id}/dashboard`);
}

export async function getBusinessRedirectUrl(userId: string): Promise<string> {
  const userBusinesses = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, userId),
    with: {
      clinic: true,
    },
  });

  if (userBusinesses.length === 0) {
    return "/clinic-form";
  }

  const firstBusiness = userBusinesses[0];
  return `/${firstBusiness.clinic.id}/dashboard`;
}

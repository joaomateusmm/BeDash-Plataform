"use server";

import { headers } from "next/headers";

import { getBusinessRedirectUrl } from "@/helpers/redirect";
import { auth } from "@/lib/auth";

export async function getRedirectUrl(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return "/authentication";
  }

  return await getBusinessRedirectUrl(session.user.id);
}

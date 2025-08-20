import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { redirectAfterAuth } from "@/helpers/redirect";

export default async function DashboardRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    await redirectAfterAuth();
  }

  // Se chegou aqui, fazer o redirecionamento
  await redirectAfterAuth();

  // Este return nunca será executado porque redirectAfterAuth sempre redireciona
  return null;
}

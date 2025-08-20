import { PropsWithChildren } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { setupUserTrial } from "@/actions/setup-user-trial";
import { TrialNotificationBanner } from "./components/trial-notification-banner";

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/authentication");
  }

  // Configurar trial automaticamente para usuários novos
  await setupUserTrial();

  return (
    <>
      <TrialNotificationBanner />
      {children}
    </>
  );
}

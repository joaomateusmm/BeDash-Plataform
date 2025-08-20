import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { redirectAfterAuth } from "@/helpers/redirect";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    await redirectAfterAuth();
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Doutor Agenda</h1>
        <p className="text-muted-foreground">
          Sistema de gerenciamento de clínicas
        </p>
        <Button asChild>
          <a href="/authentication">Fazer Login</a>
        </Button>
      </div>
    </div>
  );
}

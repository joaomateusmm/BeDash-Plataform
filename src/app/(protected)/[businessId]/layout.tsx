import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ActiveBusinessProvider } from "@/contexts/active-business-context";

import { AppSidebar } from "@/app/(protected)/[businessId]/components/app-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  // Buscar dados completos do usuário para verificar o plano
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  // Permitir acesso à página de subscription mesmo sem plano
  const headersList = await headers();
  const currentPath =
    headersList.get("x-pathname") ||
    headersList.get("x-invoke-path") ||
    headersList.get("referer") ||
    "";

  // Lista de páginas que não requerem plano
  const pagesWithoutPlanRequired = [
    "/subscription",
    "/new-subscription",
    "/clinic-form",
  ];
  const requiresPlan = !pagesWithoutPlanRequired.some((page) =>
    currentPath.includes(page),
  );

  if (!user?.plan && requiresPlan) {
    redirect("/new-subscription");
  }

  return (
    <ActiveBusinessProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </ActiveBusinessProvider>
  );
}

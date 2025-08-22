import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { clientesTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import ClientesPageContent from "./components/clientes-page-content";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

const ClientesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const clientes = await db.query.clientesTable.findMany({
    where: eq(clientesTable.clinicId, session.user.clinic.id),
  });

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageDescription>
            Liste aqui todos os clientes do seu Negócio.<br></br> Crie clientes
            para fazer <a className="text-primary font-medium">campanhas</a> de
            marketing, mandando mensagens, promoções e muito mais usando nossa
            I.A com um clique!
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <ClientesPageContent clientes={clientes} />
    </PageContainer>
  );
};

export default ClientesPage;

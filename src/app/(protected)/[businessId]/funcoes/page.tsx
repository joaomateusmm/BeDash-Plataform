import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { AddFuncaoButton } from "./components/add-funcao-button";
import { FuncoesTable } from "./components/funcoes-table";
import { db } from "@/db";
import { funcoesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

const FuncoesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  // Buscar funções da clínica
  const funcoes = await db.query.funcoesTable.findMany({
    where: eq(funcoesTable.clinicId, session.user.clinic.id),
    with: {
      profissionaisToFuncoes: {
        with: {
          profissional: true,
        },
      },
    },
    orderBy: (table, { desc }) => desc(table.createdAt),
  });

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Funções</PageTitle>
          <PageDescription>
            Crie aqui as funções que seus funcionários terão na sua empresa.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddFuncaoButton />
        </PageActions>
      </PageHeader>

      <PageContent>
        <FuncoesTable funcoes={funcoes} />
      </PageContent>
    </PageContainer>
  );
};

export default FuncoesPage;

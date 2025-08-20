import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import Image from "next/image";

import {
  PageActions,
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

import AddPatientButton from "./components/add-patient-button";
import { clientesTableColumns } from "./components/table-columns";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

const clientesPage = async () => {
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
    <  PageContainer>
    <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageDescription>
            Liste aqui todos os clientes do seu Negócio.<br></br> Crie clientes para fazer <a className="text-purple-500 font-medium">campanhas</a> de marketing, mandando mensagens, promoções e muito mais usando nossa I.A com um clique!
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <DataTable data={clientes} columns={clientesTableColumns} />
      </PageContent>
      <PageContent>
                {clientes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center mt-4 text-center">
                    <div className="mx-auto  max-w-[450px]">
                      <Image
                        src="/illustrationNaoEncontrado.svg"
                        alt="Ilustração pessoa segurando um celular"
                        width={320}
                        height={320}
                        className="mx-auto mb-4 opacity-80"
                      />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 opacity-80">
                        Nenhum cliente adicionado
                      </h3>
                      <p className="text-gray-600 mb-6 opacity-80">
                        Você ainda não possui clientes adicionados, crie um para fazer <a className="text-purple-500 font-medium">campanhas</a> de marketing, mandando mensagens, promoções e muito mais usando nossa I.A com um clique!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="hidden">
                  </div>
                )}
              </PageContent>
    </PageContainer>
  );
};

export default clientesPage;

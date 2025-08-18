import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
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
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./components/add-patient-button";
import { patientsTableColumns } from "./components/table-columns";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

const PatientsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  const patients = await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
  });
  return (
    <  PageContainer>
    <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageDescription>
            Liste aqui todos os clientes da sua barbearia. Mande emails,
            mensagens e promoções especiais.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <DataTable data={patients} columns={patientsTableColumns} />
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;

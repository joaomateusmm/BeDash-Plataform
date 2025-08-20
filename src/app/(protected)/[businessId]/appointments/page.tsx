import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";

import { PageBreadcrumb } from "@/components/page-breadcrumb";
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
import {
  appointmentsTable,
  profissionaisTable,
  clientesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import AddAppointmentButton from "./components/add-appointment-button";
import AppointmentsDataTable from "./components/appointments-data-table";

const AppointmentsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const [clientes, profissionais, appointments] = await Promise.all([
    db.query.clientesTable.findMany({
      where: eq(clientesTable.clinicId, session.user.clinic.id),
    }),
    db.query.profissionaisTable.findMany({
      where: eq(profissionaisTable.clinicId, session.user.clinic.id),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session.user.clinic.id),
      with: {
        patient: true,
        doctor: true,
      },
    }),
  ]);

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da sua empresa, crie, edite ou exclua os agendamentos.<br>
            </br> Veja quais são os clientes mais engajados na página de dashboard.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton
            clientes={clientes}
            profissionais={profissionais}
          />
        </PageActions>
      </PageHeader>
      <PageContent>
        <AppointmentsDataTable
          appointments={appointments}
          clientes={clientes}
          profissionais={profissionais}
        />
      </PageContent>
      <PageContent>
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mx-auto max-w-[360px]">
              <Image
                src="/illustrationNaoEncontrado.svg"
                alt="Ilustração pessoa segurando um celular"
                width={320}
                height={320}
                className="mx-auto mb-4 opacity-80"
              />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 opacity-80">
                Nenhum agendamento encontrado.
              </h3>
              <p className="mb-6 text-gray-600 opacity-80">
                Você ainda não possui agendamentos criados, crie um é fácil,
                basta clicar no botão acima!
              </p>
            </div>
          </div>
        ) : (
          <div className="hidden"></div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;

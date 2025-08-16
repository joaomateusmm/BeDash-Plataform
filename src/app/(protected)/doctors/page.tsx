import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
import { doctorsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

import AddDoctorButton from "./components/add-doctor-button";
import DoctorCard from "./components/doctor-card";
import { VisibilityProvider } from "./components/visibility-context";
import ToggleVisibilityButton from "./components/toggle-visibility-button";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });

  return (
    <VisibilityProvider>
      <PageContainer>
        <PageBreadcrumb />
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Profissionais</PageTitle>
            <PageDescription>Gerencie os funcionários da sua barbearia</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <div className="flex flex-row-reverse items-center gap-2">
              <AddDoctorButton /> 
              <ToggleVisibilityButton />
            </div>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="grid auto-rows-fr gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 drop-shadow-xl">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </PageContent>
      </PageContainer>
    </VisibilityProvider>
  );
};

export default DoctorsPage;
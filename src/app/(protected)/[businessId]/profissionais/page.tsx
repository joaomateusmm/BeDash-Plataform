import React from "react";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Image from "next/image";
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
import { profissionaisTable, funcoesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

import AddDoctorButton from "./components/add-doctor-button";
import DoctorCard from "./components/doctor-card";
import { VisibilityProvider } from "./components/visibility-context";
import ToggleVisibilityButton from "./components/toggle-visibility-button";

const profissionaisPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  const profissionais = await db.query.profissionaisTable.findMany({
    where: eq(profissionaisTable.clinicId, session.user.clinic.id),
    with: {
      profissionaisToFuncoes: {
        with: {
          funcao: true,
        },
      },
    },
  });

  // Buscar todas as funções disponíveis da clínica
  const funcoes = await db.query.funcoesTable.findMany({
    where: eq(funcoesTable.clinicId, session.user.clinic.id),
  });

  return (
    <VisibilityProvider>
      <PageContainer>
        <PageBreadcrumb />
        <div className="flex flex-col gap-4 text-end sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <PageHeaderContent>
            <PageTitle>Profissionais</PageTitle>
            <PageDescription>Adicione seus funcionários com determinadas funções, crie serviços específicos para cada um deles.</PageDescription>
          </PageHeaderContent>
          <div className="self-end sm:self-auto">
            <PageActions>
              <div className="flex flex-row-reverse items-center gap-2">
                <AddDoctorButton funcoes={funcoes} /> 
                <ToggleVisibilityButton />
              </div>
            </PageActions>
          </div>
        </div>
        <PageContent>
          {profissionais.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center mt-30">
              <div className="mx-auto  max-w-[360px]">
                <Image
                  src="/illustrationNaoEncontrado.svg"
                  alt="Ilustração pessoa segurando um celular"
                  width={320}
                  height={320}
                  className="mx-auto mb-4 opacity-80"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2 opacity-80">
                  Nenhum profissional adicionado
                </h3>
                <p className="text-gray-600 mb-6 opacity-80">
                  Você ainda não possui funcionários adicionados, crie um é fácil, basta clicar no botão acima!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid auto-rows-fr gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 drop-shadow-xl">
              {profissionais.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} funcoes={funcoes} />
              ))}
            </div>
          )}
        </PageContent>
      </PageContainer>
    </VisibilityProvider>
  );
};

export default profissionaisPage;
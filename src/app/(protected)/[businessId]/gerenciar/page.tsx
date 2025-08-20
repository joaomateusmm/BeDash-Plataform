"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { clinicsTable } from "@/db/schema";
import { getBusinessStats } from "@/actions/get-business-stats";
import AddBusinessButton from "./components/add-business-button";
import { PageBreadcrumb } from "@/components/page-breadcrumb";

type BusinessWithStats = typeof clinicsTable.$inferSelect & {
  _count: {
    clientes: number;
    profissionais: number;
    agendamentos: number;
  };
  stats: {
    totalRevenue: number;
    monthlyRevenue: number;
    subscription: string;
  };
};

interface GerenciarPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

const GerenciarPage = ({ params }: GerenciarPageProps) => {
  const [businessData, setBusinessData] = useState<BusinessWithStats | null>(
    null,
  );
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Resolve params para obter o businessId
  useEffect(() => {
    const resolveParams = async () => {
      const { businessId } = await params;
      setBusinessId(businessId);
    };
    resolveParams();
  }, [params]);

  const getBusinessStatsAction = useAction(getBusinessStats, {
    onSuccess: ({ data }) => {
      if (data) {
        setBusinessData(data);
      }
    },
    onError: ({ error }) => {
      console.error("Erro ao carregar dados da empresa:", error);
    },
  });

  useEffect(() => {
    if (businessId) {
      getBusinessStatsAction.execute({ businessId });
    }
  }, [businessId]);

  const isLoading = getBusinessStatsAction.isExecuting;

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gerenciar Empresa</PageTitle>
          <PageDescription>
            Gerencie sua empresa ativa, visualize estatísticas e controle todas
            as informações do seu negócio.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddBusinessButton clientes={[]} profissionais={[]} />
        </PageActions>
      </PageHeader>

      <PageContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : !businessData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="space-y-3 text-center">
              <h3 className="text-lg font-medium">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-muted-foreground">
                Não foi possível encontrar os dados desta empresa.
              </p>
              <p className="text-muted-foreground text-sm">
                Business ID: {businessId}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* TODO: Criar BusinessCard component */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">
                {businessData.name}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-sm">Clientes</p>
                  <p className="text-2xl font-bold">
                    {businessData._count.clientes}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Profissionais</p>
                  <p className="text-2xl font-bold">
                    {businessData._count.profissionais}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Agendamentos</p>
                  <p className="text-2xl font-bold">
                    {businessData._count.agendamentos}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default GerenciarPage;

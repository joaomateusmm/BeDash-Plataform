"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import {
  Building2,
  Users,
  Calendar,
  Briefcase,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Clock,
  Award,
} from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clinicsTable } from "@/db/schema";
import { getBusinessStats } from "@/actions/get-business-stats";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { formatCurrency } from "@/helpers/currency";
import BusinessCard from "./components/business-card";

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

  // Função para recarregar os dados da empresa
  const refreshBusinessData = () => {
    if (businessId) {
      getBusinessStatsAction.execute({ businessId });
    }
  };

  const isLoading = getBusinessStatsAction.isExecuting;

  // Calcular métricas avançadas com base nos dados disponíveis
  const calculateMetrics = (business: BusinessWithStats) => {
    const avgRevenuePerClient =
      business._count.clientes > 0
        ? business.stats.totalRevenue / business._count.clientes
        : 0;

    const avgRevenuePerAppointment =
      business._count.agendamentos > 0
        ? business.stats.totalRevenue / business._count.agendamentos
        : 0;

    const avgAppointmentsPerClient =
      business._count.clientes > 0
        ? business._count.agendamentos / business._count.clientes
        : 0;

    const avgAppointmentsPerProfessional =
      business._count.profissionais > 0
        ? business._count.agendamentos / business._count.profissionais
        : 0;

    const monthlyProjection = business.stats.monthlyRevenue * 12;
    const growthPotential = monthlyProjection - business.stats.totalRevenue;
    const efficiency =
      business._count.profissionais > 0
        ? (business._count.agendamentos / business._count.profissionais) * 100
        : 0;

    return {
      avgRevenuePerClient,
      avgRevenuePerAppointment,
      avgAppointmentsPerClient,
      avgAppointmentsPerProfessional,
      monthlyProjection,
      growthPotential,
      efficiency,
    };
  };

  const metrics = businessData ? calculateMetrics(businessData) : null;

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Centro de Controle Executivo</PageTitle>
          <PageDescription>
            Visão 360° da sua empresa com métricas, análises e indicadores de
            performance.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-[120px] w-full" />
              <Skeleton className="h-[120px] w-full" />
              <Skeleton className="h-[120px] w-full" />
              <Skeleton className="h-[120px] w-full" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        ) : !businessData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="space-y-3 text-center">
              <Building2 className="text-muted-foreground mx-auto h-12 w-12" />
              <h3 className="text-lg font-medium">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-muted-foreground">
                Não foi possível encontrar os dados desta empresa.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card Principal da Empresa */}
            <BusinessCard
              business={businessData}
              onBusinessUpdated={refreshBusinessData}
            />

            {/* KPIs Principais */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Faturamento Total
                  </CardTitle>
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(businessData.stats.totalRevenue)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Receita acumulada da empresa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Receita Mensal
                  </CardTitle>
                  <TrendingUp className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(businessData.stats.monthlyRevenue)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Faturamento do mês atual
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Base de Clientes
                  </CardTitle>
                  <Users className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData._count.clientes}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Total de clientes cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Agendamentos
                  </CardTitle>
                  <Calendar className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessData._count.agendamentos}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Serviços realizados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Métricas Avançadas */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Análise de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Análise de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Receita por Cliente
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(metrics?.avgRevenuePerClient || 0)}
                      </span>
                    </div>
                    <div className="bg-muted h-2 rounded-full">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${Math.min(((metrics?.avgRevenuePerClient || 0) / 1000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Receita por Agendamento
                      </span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(metrics?.avgRevenuePerAppointment || 0)}
                      </span>
                    </div>
                    <div className="bg-muted h-2 rounded-full">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min(((metrics?.avgRevenuePerAppointment || 0) / 200) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Agendamentos por Profissional
                      </span>
                      <span className="font-semibold text-purple-600">
                        {Math.round(
                          metrics?.avgAppointmentsPerProfessional || 0,
                        )}
                      </span>
                    </div>
                    <div className="bg-muted h-2 rounded-full">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{
                          width: `${Math.min(((metrics?.avgAppointmentsPerProfessional || 0) / 50) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Análise de Crescimento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Potencial de Crescimento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(metrics?.monthlyProjection || 0)}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Projeção Anual (baseada no mês atual)
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                      <span className="text-sm font-medium">
                        Eficiência da Equipe
                      </span>
                      <Badge variant="secondary">
                        {Math.round(metrics?.efficiency || 0)}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                      <span className="text-sm font-medium">
                        Engajamento por Cliente
                      </span>
                      <Badge variant="default">
                        {(metrics?.avgAppointmentsPerClient || 0).toFixed(1)}{" "}
                        agend.
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-purple-50 p-3">
                      <span className="text-sm font-medium">Ticket Médio</span>
                      <Badge variant="outline">
                        {formatCurrency(metrics?.avgRevenuePerAppointment || 0)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insights e Recomendações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Insights Estratégicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4 text-center">
                    <Activity className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                    <h4 className="font-semibold">Status da Operação</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {businessData._count.agendamentos > 50
                        ? "Alto volume"
                        : businessData._count.agendamentos > 20
                          ? "Volume moderado"
                          : "Iniciando"}
                    </p>
                    <Badge
                      variant={
                        businessData._count.agendamentos > 50
                          ? "default"
                          : businessData._count.agendamentos > 20
                            ? "secondary"
                            : "outline"
                      }
                      className="mt-2"
                    >
                      {businessData._count.agendamentos} agendamentos
                    </Badge>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <Star className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                    <h4 className="font-semibold">Nível de Fidelização</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {(metrics?.avgAppointmentsPerClient || 0) > 3
                        ? "Excelente fidelização"
                        : (metrics?.avgAppointmentsPerClient || 0) > 2
                          ? "Boa fidelização"
                          : "Oportunidade de melhoria"}
                    </p>
                    <Badge
                      variant={
                        (metrics?.avgAppointmentsPerClient || 0) > 3
                          ? "default"
                          : (metrics?.avgAppointmentsPerClient || 0) > 2
                            ? "secondary"
                            : "outline"
                      }
                      className="mt-2"
                    >
                      {(metrics?.avgAppointmentsPerClient || 0).toFixed(1)}{" "}
                      agend/cliente
                    </Badge>
                  </div>

                  <div className="rounded-lg border p-4 text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <h4 className="font-semibold">Produtividade</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {(metrics?.avgAppointmentsPerProfessional || 0) > 30
                        ? "Alta produtividade"
                        : (metrics?.avgAppointmentsPerProfessional || 0) > 15
                          ? "Produtividade normal"
                          : "Potencial de crescimento"}
                    </p>
                    <Badge
                      variant={
                        (metrics?.avgAppointmentsPerProfessional || 0) > 30
                          ? "default"
                          : (metrics?.avgAppointmentsPerProfessional || 0) > 15
                            ? "secondary"
                            : "outline"
                      }
                      className="mt-2"
                    >
                      {Math.round(metrics?.avgAppointmentsPerProfessional || 0)}{" "}
                      por profissional
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default GerenciarPage;

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { profissionaisTable, clientesTable } from "@/db/schema";
import { getDashboard } from "@/data/get-dashboard";
import { auth } from "@/lib/auth";

// Importar componentes do dashboard
import AppointmentsChart from "./components/appointments-chart";
import { DatePicker } from "./components/date-picker";
import StatsCards from "./components/stats-cards";
import TodayAppointmentsTable from "./components/today-appointments-table";
import Topprofissionais from "./components/top-profissionais";
import TopSpecialties from "./components/top-specialties";
import { TrialStatus } from "../../components/trial-status";

interface DashboardPageProps {
  params: Promise<{
    businessId: string;
  }>;
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

interface AppointmentsChartProps {
  appointmentsPerDay: { date: string; appointments: number; revenue: number }[];
}

const DashboardPage = async ({ params, searchParams }: DashboardPageProps) => {
  const { businessId } = await params;
  const { from, to } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!from || !to) {
    redirect(
      `/${businessId}/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  // Buscar dados do dashboard para esta empresa específica
  const dashboardData = await getDashboard({
    clinicId: businessId,
    from,
    to,
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Visualize as métricas e dados da empresa selecionada.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          <StatsCards
            totalRevenue={Number(dashboardData.totalRevenue.total) || 0}
            totalAppointments={dashboardData.totalAppointments.total}
            totalclientes={dashboardData.totalclientes.total}
            totalprofissionais={dashboardData.totalprofissionais.total}
          />
          <div>
            <AppointmentsChart
              appointmentsPerDay={dashboardData.dailyAppointmentsData}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
            <div className="flex gap-6">
              <Topprofissionais
                profissionais={dashboardData.topprofissionais}
              />
              <TopSpecialties topFuncoes={dashboardData.topFuncoes} />
            </div>
          </div>

          <TodayAppointmentsTable
            appointments={dashboardData.todayAppointments}
            clientes={[]}
            profissionais={[]}
          />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;

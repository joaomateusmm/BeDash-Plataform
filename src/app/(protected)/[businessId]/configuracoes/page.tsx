import { headers } from "next/headers";
import { redirect } from "next/navigation";
import dayjs from "dayjs";
import {
  User,
  Settings,
  Shield,
  Palette,
  CreditCard,
  Building2,
  Mail,
  Clock,
  Calendar,
  Crown,
} from "lucide-react";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { auth } from "@/lib/auth";
import { getUserSettings } from "@/data/get-user-settings";

interface ConfiguracoesPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

const ConfiguracoesPage = async ({ params }: ConfiguracoesPageProps) => {
  const { businessId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const { user, clinics } = await getUserSettings(session.user.id);

  if (!user) {
    redirect("/authentication");
  }

  // Calcular informações do plano
  const getPlanInfo = () => {
    const planLabels = {
      basico_trial: "Básico (Trial)",
      basico: "Básico",
      profissional: "Profissional",
      avancado: "Avançado",
    };

    const planColors = {
      basico_trial: "bg-blue-100 text-blue-800",
      basico: "bg-green-100 text-green-800",
      profissional: "bg-purple-100 text-purple-800",
      avancado: "bg-orange-100 text-orange-800",
    };

    return {
      label: planLabels[user.plan || "basico_trial"],
      color: planColors[user.plan || "basico_trial"],
    };
  };

  const planInfo = getPlanInfo();

  // Calcular dias restantes do trial
  const getTrialInfo = () => {
    if (!user.isInTrial || !user.trialEndDate) return null;

    const now = dayjs();
    const trialEnd = dayjs(user.trialEndDate);
    const daysRemaining = trialEnd.diff(now, "day");

    return {
      daysRemaining,
      endDate: trialEnd.format("DD/MM/YYYY"),
      isExpired: daysRemaining < 0,
    };
  };

  const trialInfo = getTrialInfo();

  // Gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Configurações</PageTitle>
          <PageDescription>
            Gerencie sua conta, preferências e personalizações.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Card de Informações da Conta */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="text-primary h-5 w-5" />
                <CardTitle>Informações da Conta</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Perfil do Usuário */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    {user.emailVerified && (
                      <Badge
                        variant="outline"
                        className="border-green-500/20 text-green-600 dark:text-green-400"
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Membro desde {dayjs(user.createdAt).format("DD/MM/YYYY")}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informações do Plano */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium">
                  <CreditCard className="h-4 w-4" />
                  Plano Atual
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={planInfo.color}>
                      <Crown className="mr-1 h-3 w-3" />
                      {planInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Informações do Trial */}
                {trialInfo && (
                  <div className="border-primary/20 bg-primary/10 rounded-lg border p-4">
                    <div className="text-primary flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {trialInfo.isExpired
                          ? "Trial Expirado"
                          : `${trialInfo.daysRemaining} dias restantes no trial`}
                      </span>
                    </div>
                    <p className="text-primary/90 mt-1 text-sm">
                      {trialInfo.isExpired
                        ? `Seu trial expirou em ${trialInfo.endDate}`
                        : `Seu trial expira em ${trialInfo.endDate}`}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Empresas Cadastradas */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium">
                  <Building2 className="h-4 w-4" />
                  Empresas Cadastradas ({clinics.length})
                </h4>
                <div className="grid gap-3">
                  {clinics.map((clinic) => (
                    <div
                      key={clinic.clinicId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{clinic.clinicName}</p>
                        <p className="text-muted-foreground text-sm">
                          Criada em{" "}
                          {dayjs(clinic.clinicCreatedAt).format("DD/MM/YYYY")}
                        </p>
                      </div>
                      {clinic.clinicId === businessId && (
                        <Badge variant="secondary">Atual</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Personalização */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="text-primary h-5 w-5" />
                <CardTitle>Personalização</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tema da Interface</h4>
                    <p className="text-muted-foreground text-sm">
                      Escolha entre tema claro, escuro ou automático
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Segurança */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="text-primary h-5 w-5" />
                <CardTitle>Segurança</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Email Verificado</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {user.emailVerified ? (
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400">
                        <Shield className="mr-1 h-3 w-3" />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Não Verificado</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium">Última Atividade</h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Sessão ativa • Agora
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ConfiguracoesPage;

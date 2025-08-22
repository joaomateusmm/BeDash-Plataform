"use client";

import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  Calendar,
  Blocks,
  Building,
  Infinity,
} from "lucide-react";
import { headers } from "next/headers";
import { use } from "react";

import { useTrialMonitor } from "@/hooks/use-trial-monitor";
import { getPlanInfo } from "@/helpers/plan-info";
import { auth } from "@/lib/auth";

interface PlanLimitsProgressProps {
  showDetails?: boolean;
  compact?: boolean;
  userPlan?: string | null;
}

/**
 * Componente que mostra o progresso dos limites do plano atual
 */
export function PlanLimitsProgress({
  showDetails = false,
  compact = false,
  userPlan,
}: PlanLimitsProgressProps) {
  const monitor = useTrialMonitor();
  const planInfo = getPlanInfo(userPlan || null);

  const limits = [
    {
      key: "currentClients" as const,
      icon: Users,
      label: "Clientes",
      current: monitor.usage.currentClients,
      max:
        planInfo.limits.clients === "unlimited" ? "∞" : planInfo.limits.clients,
      isUnlimited: planInfo.limits.clients === "unlimited",
      color: planInfo.iconClass,
      bgColor: "bg-muted/50",
    },
    {
      key: "currentDoctors" as const,
      icon: Briefcase,
      label: "Profissionais",
      current: monitor.usage.currentDoctors,
      max:
        planInfo.limits.professionals === "unlimited"
          ? "∞"
          : planInfo.limits.professionals,
      isUnlimited: planInfo.limits.professionals === "unlimited",
      color: planInfo.iconClass,
      bgColor: "bg-muted/50",
    },
    {
      key: "currentAppointmentsThisMonth" as const,
      icon: Calendar,
      label: "Agendamentos/mês",
      current: monitor.usage.currentAppointmentsThisMonth,
      max:
        planInfo.limits.appointments === "unlimited"
          ? "∞"
          : planInfo.limits.appointments,
      isUnlimited: planInfo.limits.appointments === "unlimited",
      color: planInfo.iconClass,
      bgColor: "bg-muted/50",
    },
    {
      key: "currentFunctions" as const,
      icon: Blocks,
      label: "Funções",
      current: monitor.usage.currentFunctions,
      max:
        planInfo.limits.functions === "unlimited"
          ? "∞"
          : planInfo.limits.functions,
      isUnlimited: planInfo.limits.functions === "unlimited",
      color: planInfo.iconClass,
      bgColor: "bg-muted/50",
    },
    {
      key: "companies" as const,
      icon: Building,
      label: "Empresas",
      current: 1, // Por enquanto sempre 1, depois implementar contagem real
      max:
        planInfo.limits.companies === "unlimited"
          ? "∞"
          : planInfo.limits.companies,
      isUnlimited: planInfo.limits.companies === "unlimited",
      color: planInfo.iconClass,
      bgColor: "bg-muted/50",
    },
  ];

  // Mostrar loading enquanto carrega
  if (monitor.isLoading) {
    return (
      <Card className={planInfo.cardClass}>
        <CardHeader className="pb-3">
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/20" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 animate-pulse rounded bg-white/20" />
              <div className="h-2 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-6 ${planInfo.cardClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-base font-medium ${planInfo.titleClass}`}>
            Limites do Plano {planInfo.name}
          </CardTitle>
          <Badge
            className={`text-xs ${
              planInfo.type === "profissional"
                ? "bg-white/30 text-gray-900 dark:text-white"
                : planInfo.type === "avancado"
                  ? "bg-white/30 text-gray-900 dark:text-white"
                  : "bg-primary/10 text-primary"
            }`}
          >
            {planInfo.name}
          </Badge>
        </div>
        <CardDescription className={`text-xs ${planInfo.textClass}`}>
          Acompanhe seu uso dos recursos disponíveis no plano{" "}
          {planInfo.name.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.map((limit) => {
          // Tratar companies separadamente pois não existe no monitor
          const percentage =
            limit.isUnlimited || limit.key === "companies"
              ? 0
              : monitor.getUsagePercentage(limit.key);
          const isNearLimit =
            !limit.isUnlimited &&
            limit.key !== "companies" &&
            monitor.isNearLimit(limit.key);
          const isAtLimit =
            !limit.isUnlimited &&
            limit.key !== "companies" &&
            monitor.isAtLimit(limit.key);

          return (
            <div
              key={limit.key}
              className="rounded-lg bg-white/20 p-3 backdrop-blur-sm dark:bg-black/20"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <limit.icon className={`h-4 w-4 ${limit.color}`} />
                  <span
                    className={`text-sm font-medium ${planInfo.titleClass}`}
                  >
                    {limit.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${planInfo.titleClass}`}
                  >
                    {limit.current} / {limit.max}
                  </span>
                  {limit.isUnlimited && (
                    <Badge className="bg-green-500/20 text-xs text-green-700 dark:text-green-400">
                      <Infinity className="mr-1 h-3 w-3" />
                      Ilimitado
                    </Badge>
                  )}
                  {!limit.isUnlimited && percentage > 0 && (
                    <span className={`text-xs ${planInfo.textClass}`}>
                      ({percentage.toFixed(0)}%)
                    </span>
                  )}
                  {isAtLimit && (
                    <Badge className="bg-red-500/20 text-xs text-red-700 dark:text-red-400">
                      Limite
                    </Badge>
                  )}
                  {isNearLimit && !isAtLimit && (
                    <Badge className="bg-orange-500/20 text-xs text-orange-700 dark:text-orange-400">
                      Quase no limite
                    </Badge>
                  )}
                </div>
              </div>

              {!limit.isUnlimited && (
                <Progress
                  value={percentage}
                  className={`h-2 bg-white/20 dark:bg-black/20`}
                />
              )}

              {limit.isUnlimited && (
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400/30 to-blue-400/30" />
              )}

              {showDetails && (
                <p className={`mt-1 text-xs ${planInfo.textClass}`}>
                  {limit.isUnlimited
                    ? "Sem limites para este recurso"
                    : percentage === 0
                      ? "Nenhum uso registrado"
                      : isAtLimit
                        ? "Você atingiu o limite deste recurso"
                        : isNearLimit
                          ? "Próximo do limite - considere fazer upgrade"
                          : "Uso dentro do limite normal"}
                </p>
              )}
            </div>
          );
        })}

        {planInfo.type === "basico_trial" || planInfo.type === "basico" ? (
          <div className="border-t border-white/20 pt-2">
            <p className={`text-xs ${planInfo.textClass}`}>
              Faça upgrade para o plano Profissional para ter limites maiores e
              recursos avançados.
            </p>
          </div>
        ) : planInfo.type === "profissional" ? (
          <div className="border-t border-white/20 pt-2">
            <p className={`text-xs ${planInfo.textClass}`}>
              Upgrade para o plano Avançado para recursos ilimitados.
            </p>
          </div>
        ) : (
          <div className="border-t border-white/20 pt-2">
            <p className={`text-xs ${planInfo.textClass}`}>
              Você tem acesso a todos os recursos premium ilimitados.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

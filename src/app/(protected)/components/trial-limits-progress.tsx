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
import { Users, Briefcase, Calendar, Blocks } from "lucide-react";

import { useTrialMonitor } from "@/hooks/use-trial-monitor";

interface TrialLimitsProgressProps {
  showDetails?: boolean;
  compact?: boolean;
}

/**
 * Componente que mostra o progresso dos limites do trial
 */
export function TrialLimitsProgress({
  showDetails = false,
  compact = false,
}: TrialLimitsProgressProps) {
  const monitor = useTrialMonitor();

  const limits = [
    {
      key: "currentClients" as const,
      icon: Users,
      label: "Clientes",
      current: monitor.usage.currentClients,
      max: monitor.limits.maxClients,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      key: "currentDoctors" as const,
      icon: Briefcase,
      label: "Profissionais",
      current: monitor.usage.currentDoctors,
      max: monitor.limits.maxDoctors,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      key: "currentAppointmentsThisMonth" as const,
      icon: Calendar,
      label: "Agendamentos/mês",
      current: monitor.usage.currentAppointmentsThisMonth,
      max: monitor.limits.maxAppointmentsPerMonth,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      key: "currentFunctions" as const,
      icon: Blocks,
      label: "Funções",
      current: monitor.usage.currentFunctions,
      max: monitor.limits.maxFunctions,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  // Mostrar loading enquanto carrega
  if (monitor.isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-gray-100" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 animate-pulse rounded bg-gray-200" />
              <div className="h-2 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Limites do Plano Básico
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Plano Básico
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Acompanhe seu uso dos recursos disponíveis no plano básico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.map((limit) => {
          const percentage = monitor.getUsagePercentage(limit.key);
          const isNearLimit = monitor.isNearLimit(limit.key);
          const isAtLimit = monitor.isAtLimit(limit.key);

          return (
            <div key={limit.key} className={`rounded-lg p-3 ${limit.bgColor}`}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <limit.icon className={`h-4 w-4 ${limit.color}`} />
                  <span className="text-sm font-medium">{limit.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {limit.current} / {limit.max}
                  </span>
                  {percentage > 0 && (
                    <span className="text-xs text-gray-500">
                      ({percentage.toFixed(0)}%)
                    </span>
                  )}
                  {isAtLimit && (
                    <Badge variant="destructive" className="text-xs">
                      Limite
                    </Badge>
                  )}
                  {isNearLimit && !isAtLimit && (
                    <Badge
                      variant="outline"
                      className="border-yellow-400 text-xs text-yellow-700"
                    >
                      Quase no limite
                    </Badge>
                  )}
                </div>
              </div>
              <Progress
                value={percentage}
                className={`h-2 ${
                  isAtLimit
                    ? "bg-red-100 [&>div]:bg-red-600"
                    : isNearLimit
                      ? "bg-yellow-100 [&>div]:bg-yellow-500"
                      : "bg-green-100 [&>div]:bg-green-500"
                }`}
              />
              {showDetails && (
                <p className="mt-1 text-xs text-gray-600">
                  {percentage === 0
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

        <div className="border-t pt-2">
          <p className="text-muted-foreground text-xs">
            Faça upgrade para o plano Professional para ter limites maiores e
            recursos avançados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Star,
  AlertTriangle,
  Crown,
  CheckCircle,
} from "lucide-react";
import { headers } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getTrialStatus } from "@/helpers/trial";
import { getPlanInfo } from "@/helpers/plan-info";
import { auth } from "@/lib/auth";

export async function TrialInfoCard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <div className="text-muted-foreground text-sm">
        Usuário não encontrado
      </div>
    );
  }

  const user = session.user;
  const trialStatus = getTrialStatus(user);
  const planInfo = getPlanInfo(user.plan || null);

  // Determinar se está em trial ou plano pago
  const isInTrial = user.plan === "basico_trial" && trialStatus.isActive;
  const isPaidPlan = user.plan && !user.plan.includes("trial");

  const getStatusIcon = () => {
    if (isPaidPlan) {
      return <Crown className="h-4 w-4" />;
    }
    if (isInTrial) {
      return trialStatus.daysRemaining <= 3 ? (
        <AlertTriangle className="h-4 w-4" />
      ) : (
        <Star className="h-4 w-4" />
      );
    }
    if (trialStatus.isExpired) {
      return <Clock className="h-4 w-4" />;
    }
    return <Calendar className="h-4 w-4" />;
  };

  const getStatusLabel = () => {
    if (isPaidPlan) {
      return `Plano ${planInfo.name} Ativo`;
    }
    if (isInTrial) {
      return trialStatus.daysRemaining <= 3
        ? "Trial Terminando em Breve"
        : "Trial Ativo";
    }
    if (trialStatus.isExpired) {
      return "Trial Expirado";
    }
    return "Sem Trial";
  };

  const getStatusColor = () => {
    if (isPaidPlan) {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    }
    if (isInTrial) {
      return trialStatus.daysRemaining <= 3
        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
    if (trialStatus.isExpired) {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    }
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className={`p-6 ${planInfo.cardClass}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${planInfo.iconBgClass}`}>
            {getStatusIcon()}
          </div>
          <div>
            <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
            <p className={`mt-1 text-sm ${planInfo.textClass}`}>
              Plano atual: <span className="font-medium">{planInfo.name}</span>
            </p>
          </div>
        </div>

        {/* Informações de data para trial */}
        {isInTrial && user.trialStartDate && user.trialEndDate && (
          <div className="grid grid-cols-1 gap-4 rounded-lg bg-white/20 p-4 backdrop-blur-sm md:grid-cols-2 dark:bg-black/20">
            <div>
              <p className={`text-sm font-medium ${planInfo.textClass}`}>
                Início do Trial
              </p>
              <p className={`font-mono text-sm ${planInfo.titleClass}`}>
                {format(
                  new Date(user.trialStartDate),
                  "dd/MM/yyyy 'às' HH:mm",
                  {
                    locale: ptBR,
                  },
                )}
              </p>
            </div>
            <div>
              <p className={`text-sm font-medium ${planInfo.textClass}`}>
                Término do Trial
              </p>
              <p className={`font-mono text-sm ${planInfo.titleClass}`}>
                {format(new Date(user.trialEndDate), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        )}

        {/* Informações para planos pagos */}
        {isPaidPlan && (
          <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm dark:bg-black/20">
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${planInfo.iconClass}`} />
              <p className={`text-sm font-medium ${planInfo.titleClass}`}>
                Assinatura Ativa
              </p>
            </div>
            <p className={`text-sm ${planInfo.textClass}`}>
              Seu plano {planInfo.name} está ativo e todos os recursos estão
              disponíveis.
            </p>
          </div>
        )}

        {/* Dias restantes do trial */}
        {isInTrial && trialStatus.daysRemaining > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-white/20 p-3 backdrop-blur-sm dark:bg-black/20">
            <Clock className={`h-4 w-4 ${planInfo.iconClass}`} />
            <span className={`text-sm ${planInfo.titleClass}`}>
              <strong>{trialStatus.daysRemaining}</strong> dias restantes no seu
              trial
            </span>
          </div>
        )}

        {/* Trial expirado */}
        {trialStatus.isExpired && !isPaidPlan && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm text-red-800 dark:text-red-400">
              Seu trial expirou. Faça upgrade para continuar usando todas as
              funcionalidades.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

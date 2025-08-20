import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Star, AlertTriangle } from "lucide-react";
import { headers } from "next/headers";

import { Badge } from "@/components/ui/badge";
import { getTrialStatus } from "@/helpers/trial";
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

  const getStatusIcon = () => {
    if (trialStatus.isActive) {
      return trialStatus.daysRemaining <= 3 ? (
        <AlertTriangle className="h-4 w-4 text-orange-500" />
      ) : (
        <Star className="h-4 w-4 text-blue-500" />
      );
    }
    if (trialStatus.isExpired) {
      return <Clock className="h-4 w-4 text-red-500" />;
    }
    return <Calendar className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = () => {
    if (trialStatus.isActive) {
      return trialStatus.daysRemaining <= 3
        ? "bg-orange-100 text-orange-800"
        : "bg-blue-100 text-blue-800";
    }
    if (trialStatus.isExpired) {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = () => {
    if (trialStatus.isActive) {
      return trialStatus.daysRemaining <= 3
        ? "Terminando em Breve"
        : "Trial Ativo";
    }
    if (trialStatus.isExpired) {
      return "Trial Expirado";
    }
    return "Sem Trial";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <Badge className={getStatusColor()}>{getStatusLabel()}</Badge>
          <p className="text-muted-foreground mt-1 text-sm">
            Plano atual:{" "}
            <span className="font-medium capitalize">
              {user.plan?.replace("_", " ") || "Não definido"}
            </span>
          </p>
        </div>
      </div>

      {user.trialStartDate && user.trialEndDate && (
        <div className="bg-muted/50 grid grid-cols-1 gap-4 rounded-lg p-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Início do Trial
            </p>
            <p className="font-mono text-sm">
              {format(new Date(user.trialStartDate), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Término do Trial
            </p>
            <p className="font-mono text-sm">
              {format(new Date(user.trialEndDate), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      )}

      {trialStatus.daysRemaining > 0 && (
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <Clock className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">
            <strong>{trialStatus.daysRemaining}</strong> dias restantes no seu
            trial
          </span>
        </div>
      )}

      {trialStatus.isExpired && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            Seu trial expirou. Faça upgrade para continuar usando todas as
            funcionalidades.
          </p>
        </div>
      )}
    </div>
  );
}

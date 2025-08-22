"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SubscriptionStatus {
  status: string;
  plan: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionCardProps {
  userId: string;
  userPlan: string | null;
  onManageSubscription?: () => void;
}

const statusConfig = {
  active: {
    label: "Ativo",
    color: "bg-green-500",
    icon: CheckCircle,
    variant: "default" as const,
  },
  trialing: {
    label: "Período de Teste",
    color: "bg-blue-500",
    icon: Clock,
    variant: "secondary" as const,
  },
  past_due: {
    label: "Pagamento Atrasado",
    color: "bg-yellow-500",
    icon: AlertTriangle,
    variant: "destructive" as const,
  },
  canceled: {
    label: "Cancelado",
    color: "bg-red-500",
    icon: XCircle,
    variant: "destructive" as const,
  },
  unpaid: {
    label: "Não Pago",
    color: "bg-red-500",
    icon: CreditCard,
    variant: "destructive" as const,
  },
  no_subscription: {
    label: "Sem Assinatura",
    color: "bg-gray-500",
    icon: XCircle,
    variant: "secondary" as const,
  },
};

export function SubscriptionCard({
  userId,
  userPlan,
  onManageSubscription,
}: SubscriptionCardProps) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch(
          `/api/subscription/status?userId=${userId}`,
        );
        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setStatus({
            ...data,
            currentPeriodEnd: data.currentPeriodEnd
              ? new Date(data.currentPeriodEnd)
              : null,
          });
        }
      } catch (err) {
        setError("Erro ao carregar status da assinatura");
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      checkStatus();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Erro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const config =
    statusConfig[status?.status as keyof typeof statusConfig] ||
    statusConfig.no_subscription;
  const Icon = config.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getDaysUntilExpiration = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Status da Assinatura
        </CardTitle>
        <CardDescription>Informações sobre seu plano atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <Badge
              variant={config.variant}
              className="flex w-fit items-center gap-1"
            >
              <div className={`h-2 w-2 rounded-full ${config.color}`} />
              {config.label}
            </Badge>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-sm font-medium">Plano</p>
            <Badge variant="outline">
              {userPlan
                ? userPlan.charAt(0).toUpperCase() + userPlan.slice(1)
                : "Gratuito"}
            </Badge>
          </div>
        </div>

        {status?.currentPeriodEnd && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                {status.cancelAtPeriodEnd ? "Expira em:" : "Renova em:"}{" "}
                {formatDate(status.currentPeriodEnd)}
              </span>
            </div>

            {status.cancelAtPeriodEnd && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Assinatura será cancelada em{" "}
                    {getDaysUntilExpiration(status.currentPeriodEnd)} dias
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {onManageSubscription && (
          <Button
            onClick={onManageSubscription}
            variant="outline"
            className="w-full"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Gerenciar Assinatura
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

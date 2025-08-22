"use client";

import { Check, Crown, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { headers } from "next/headers";
import { use } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";

interface PlanUpgradeSectionProps {
  userPlan?: string | null;
}

const plans = [
  {
    id: "basico",
    name: "Básico",
    price: "R$ 30",
    period: "por mês",
    description: "Para profissionais autônomos ou pequenas empresas",
    features: [
      "Cadastro de até 1 Empresa",
      "Até 10 profissionais",
      "Até 10 funções",
      "100 Agendamentos por mês",
    ],
    popular: false,
  },
  {
    id: "profissional",
    name: "Profissional",
    price: "R$ 45",
    period: "por mês",
    description: "Para médias empresas ou em crescimento",
    features: [
      "Cadastro de até 3 Empresas",
      "Nosso Agente de I.A",
      "Até 50 profissionais",
      "500 Clientes por mês",
    ],
    popular: true,
  },
  {
    id: "avancado",
    name: "Avançado",
    price: "R$ 60",
    period: "por mês",
    description: "Empresas já estabelecidas e consolidadas no mercado",
    features: [
      "Cadastro de até 10 Empresas",
      "Profissionais Ilimitados",
      "Clientes Ilimitados",
      "Agendamentos Ilimitados",
    ],
    popular: false,
  },
];

export function PlanUpgradeSection({ userPlan }: PlanUpgradeSectionProps) {
  const params = useParams();
  const businessId = params.businessId as string;

  const getCurrentPlanStatus = (planId: string) => {
    if (userPlan === "basico_trial") {
      return planId === "basico" ? "trial" : "upgrade";
    }
    return userPlan === planId
      ? "current"
      : userPlan &&
          plans.findIndex((p) => p.id === userPlan) >
            plans.findIndex((p) => p.id === planId)
        ? "downgrade"
        : "upgrade";
  };

  return (
    <div className="space-y-10">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            <CardTitle className="text-foreground text-lg">
              Desbloqueie novos recursos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Desbloqueie mais recursos e capacidades para sua empresa.
          </p>

          <div className="space-y-4">
            {plans.map((plan) => {
              const status = getCurrentPlanStatus(plan.id);

              return (
                <div
                  key={plan.name}
                  className={`flex flex-col gap-y-3 rounded-lg border p-4 transition-colors ${
                    status === "current"
                      ? "border-primary/20 bg-primary/5"
                      : plan.popular
                        ? "border-0 bg-gradient-to-br from-indigo-200/30 to-purple-400/30 text-white shadow-xl dark:bg-gradient-to-br dark:from-indigo-400/15 dark:to-purple-500/20"
                        : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-foreground font-semibold">
                          {plan.name}
                        </h4>
                        {status === "current" && (
                          <Badge className="bg-primary/10 text-primary text-xs">
                            <Zap className="mr-1 h-3 w-3" />
                            Plano Atual
                          </Badge>
                        )}
                        {status === "trial" && (
                          <Badge className="bg-blue-100 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            <Zap className="mr-1 h-3 w-3" />
                            Trial Atual
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-foreground font-bold">{plan.price}</p>
                      <p className="text-muted-foreground text-xs">
                        {plan.period}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                    {plan.features.slice(0, 4).map((feature) => (
                      <div key={feature} className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-green-500 dark:text-green-400" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2">
            <Link href={`/${businessId}/subscription`}>
              <Button className="w-full py-6" size="lg">
                Ver Todos os Planos
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

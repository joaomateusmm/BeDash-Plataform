"use client";

import { Check, Crown, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Básico",
    price: "R$ 29,90",
    period: "por mês",
    description: "Ideal para pequenas empresas",
    features: [
      "100 Clientes",
      "100 Agendamentos por mês",
      "Dashboards Completos",
      "Suporte no WhatsApp ou Email",
    ],
    disabled: [],
    popular: false,
    current: true,
  },
  {
    name: "Profissional",
    price: "R$ 59,90",
    period: "por mês",
    description: "Para médias empresas ou em crescimento",
    features: [
      "3 Empresas",
      "1000 Clientes por mês",
      "1000 Agendamentos por mês",
      "Suporte prioritário",
    ],
    disabled: [],
    popular: true,
    current: false,
  },
  {
    name: "Avançado",
    price: "R$ 119,90",
    period: "por mês",
    description: "Empresas já estabelecidas e consolidadas no mercado",
    features: [
      "10 Empresas",
      "Clientes ilimitados",
      "Agendamentos ilimitadas",
      "Profissionais ilimitados",
    ],
    disabled: [],
    popular: false,
    current: false,
  },
];

export function PlanUpgradeSection() {
  const params = useParams();
  const businessId = params.businessId as string;

  return (
    <div className="space-y-10">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">
              Desbloqueie novos recursos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Desbloqueie mais recursos e capacidades para sua empresa.
          </p>

          <div className="space-y-7">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col gap-y-3 rounded-lg border p-3 ${
                  plan.current
                    ? "border-gray-200"
                    : plan.popular
                      ? "border-purple-200 bg-purple-50"
                      : "border-gray-200"
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {plan.popular && (
                        <Badge className="bg-blue-400 text-xs text-gray-100">
                          <Star className="mr-1 h-3 w-3 font-bold" />
                          Popular
                        </Badge>
                      )}
                      {plan.current && (
                        <Badge className="bg-purple-100 text-xs text-purple-800">
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
                    <p className="font-bold">{plan.price}</p>
                    <p className="text-muted-foreground text-xs">
                      {plan.period}
                    </p>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                  {plan.features.slice(0, 4).map((feature) => (
                    <div key={feature} className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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

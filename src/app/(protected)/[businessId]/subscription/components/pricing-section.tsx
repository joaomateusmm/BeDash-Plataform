"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { createCustomerPortal } from "@/actions/create-customer-portal";

interface PricingSectionProps {
  userPlan: string | null;
  userEmail: string;
  businessId: string;
}

export function PricingSection({
  userPlan,
  userEmail,
  businessId,
}: PricingSectionProps) {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
      setLoadingPlan(null);
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key not found");
      }
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      );
      if (!stripe) {
        throw new Error("Stripe not found");
      }
      if (!data?.sessionId) {
        throw new Error("Session ID not found");
      }
      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
    },
    onError: () => {
      setLoadingPlan(null);
    },
  });

  const createCustomerPortalAction = useAction(createCustomerPortal, {
    onSuccess: ({ data }) => {
      setIsLoadingPortal(false);
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      setIsLoadingPortal(false);
    },
  });

  const handleManagePlanClick = () => {
    setIsLoadingPortal(true);
    createCustomerPortalAction.execute({
      businessId,
    });
  };

  const handleSubscribeClick = (
    planType: "basico" | "professional" | "advanced",
  ) => {
    setLoadingPlan(planType);
    createStripeCheckoutAction.execute({
      plan: planType,
      billingPeriod,
      businessId,
    });
  };

  const plans = [
    {
      name: "Básico",
      planType: "basico" as const,
      price: 30,
      description: "Para profissionais autônomos ou pequenas empresas",
      features: [
        "Cadastro de até 1 Empresa",
        "Até 10 profissionais",
        "Até 10 funções",
        "100 Agendamentos por mês",
        "100 Clientes por mês",
        "Campanhas de WhatsApp e Email",
        "Suporte Completo",
      ],
      buttonText: userPlan === "basico" ? "Plano Atual" : "Começar Agora",
      buttonVariant: "outline" as const,
      isPopular: false,
      isActive: userPlan === "basico",
    },
    {
      name: "Profissional",
      planType: "professional" as const,
      price: 45,
      description: "Para médias empresas ou em crescimento",
      features: [
        "Cadastro de até 3 Empresas",
        "Nosso Agente de I.A",
        "Até 50 profissionais",
        "Até 50 funções",
        "500 Clientes por mês",
        "500 Agendamentos por mês",
        "Campanhas personalizadas",
        "Suporte prioritário",
      ],
      buttonText:
        userPlan === "professional"
          ? "Plano Atual"
          : userPlan === "avancado"
            ? "Fazer Downgrade"
            : "Fazer Upgrade",
      buttonVariant: "default" as const,
      isPopular: true,
      isActive: userPlan === "professional",
    },
    {
      name: "Avançado",
      planType: "advanced" as const,
      price: 60,
      description: "Empresas já estabelecidas e consolidadas no mercado",
      features: [
        "Cadastro de até 10 Empresas",
        "Nosso Agente de I.A",
        "Profissionais Ilimitados",
        "Funções Ilimitadas",
        "Clientes Ilimitados",
        "Agendamentos Ilimitados",
        "Campanhas personalizadas",
        "Suporte prioritário",
      ],
      buttonText: userPlan === "avancado" ? "Plano Atual" : "Fazer Upgrade",
      buttonVariant: "outline" as const,
      isPopular: false,
      isActive: userPlan === "avancado",
    },
  ];

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Botão Gerenciar Assinatura para usuários com plano ativo */}
        {userPlan && !userPlan.includes("trial") && (
          <div className="mb-8 flex justify-center">
            <Button
              variant="outline"
              onClick={handleManagePlanClick}
              disabled={isLoadingPortal}
              className="bg-background/50 border-border/50 hover:bg-background/70 px-6 py-2 backdrop-blur-sm"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                "Gerenciar Assinatura"
              )}
            </Button>
          </div>
        )}

        {/* Billing Toggle */}
        <div className="mb-12 flex justify-center">
          <div className="border-border bg-background rounded-full border p-1 shadow-sm">
            <div className="flex">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  billingPeriod === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                MENSAL
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  billingPeriod === "yearly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ANUAL
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.isPopular
                  ? "scale-105 border-0 bg-gradient-to-br from-indigo-200/30 to-purple-400/50 text-white shadow-xl dark:bg-gradient-to-br dark:from-indigo-400/15 dark:to-purple-500/20"
                  : plan.name === "Avançado"
                    ? "border-0 bg-gradient-to-br from-red-500/20 to-red-800/20 shadow-xl dark:bg-gradient-to-br dark:from-gray-600/15 dark:to-red-500/30"
                    : "bg-transparent shadow-xl"
              }`}
            >
              <CardHeader className="pb-4">
                <div className="mb-4">
                  <div
                    className={`mb-1 text-4xl font-bold ${plan.isPopular || plan.name === "Avançado" ? "text-gray-900 dark:text-white" : "text-foreground"}`}
                  >
                    {plan.isPopular && (
                      <div className="absolute left-1/2 transform">
                        <div className="rounded-full bg-indigo-200/30 px-4 py-1 text-xs font-medium text-gray-900 drop-shadow-sm dark:text-gray-50">
                          MAIS POPULAR
                        </div>
                      </div>
                    )}
                    <a className="text-muted-foreground text-sm">R$</a>
                    {billingPeriod === "yearly" ? plan.price * 11 : plan.price}
                    <span
                      className={`text-lg font-normal ${plan.isPopular ? "text-gray-600 dark:text-purple-100" : plan.name === "Avançado" ? "text-gray-600 dark:text-red-100" : "text-muted-foreground"}`}
                    >
                      /{billingPeriod === "yearly" ? "ano" : "mês"}
                    </span>
                  </div>
                  {billingPeriod === "yearly" && (
                    <div
                      className={`text-sm ${plan.isPopular ? "text-gray-600 dark:text-purple-100" : plan.name === "Avançado" ? "text-gray-600 dark:text-red-100" : "text-green-600 dark:text-green-400"}`}
                    >
                      1 mês grátis!
                    </div>
                  )}
                </div>
                <h3
                  className={`mb-3 text-2xl font-bold ${plan.isPopular || plan.name === "Avançado" ? "text-gray-900 dark:text-white" : "text-foreground"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${plan.isPopular ? "text-gray-700 dark:text-purple-100" : plan.name === "Avançado" ? "text-gray-700 dark:text-red-100" : "text-muted-foreground"}`}
                >
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <div
                        className={`rounded-full p-1 ${plan.isPopular ? "bg-white/30" : plan.name === "Avançado" ? "bg-white/30" : "bg-green-100 dark:bg-green-900/20"}`}
                      >
                        <Check
                          className={`h-3 w-3 ${plan.isPopular || plan.name === "Avançado" ? "text-gray-900 dark:text-white" : "text-green-600 dark:text-green-400"}`}
                        />
                      </div>
                      <span
                        className={`text-sm ${plan.isPopular || plan.name === "Avançado" ? "text-gray-900 dark:text-white" : "text-foreground"}`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {loadingPlan === plan.planType ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className={`w-full cursor-pointer border py-6 backdrop-blur-md transition-all duration-500 hover:scale-[1.02] ${
                        plan.isPopular
                          ? "border-white/30 bg-white/20 text-gray-900 shadow-lg hover:bg-white/20 dark:text-white"
                          : plan.name === "Avançado"
                            ? "border-white/30 bg-white/20 text-gray-900 shadow-lg hover:bg-white/20 dark:text-white"
                            : plan.isActive
                              ? "bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/30 cursor-not-allowed opacity-75"
                              : "bg-background/20 border-border/30 text-foreground hover:bg-background/30 shadow-lg backdrop-blur-sm"
                      }`}
                      onClick={
                        plan.isActive
                          ? undefined
                          : () => handleSubscribeClick(plan.planType)
                      }
                      disabled={
                        plan.isActive || loadingPlan !== null || isLoadingPortal
                      }
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

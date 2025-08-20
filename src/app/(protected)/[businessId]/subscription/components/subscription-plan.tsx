"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SubscriptionPlanProps {
  active?: boolean;
  className?: string;
  userEmail: string;
}

export function SubscriptionPlan({
  active = false,
  className,
  userEmail,
}: SubscriptionPlanProps) {
  const router = useRouter();
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
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
  });
  const features = [
    "Cadastro de até 5 profissionais.",
    "Agendamentos ilimitados.",
    "Cadastro de clientes ilimitados.",
    "Métricas básicas.",
    "Confirmação manual.",
    "Suporte via e-mail e WhatsApp.",
  ];

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute();
  };

  const handleManagePlanClick = () => {
    router.push(
      `${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${userEmail}`,
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Básico</h3>
          {active ? (
            <Badge className="cursor-default bg-purple-100 text-purple-700 duration-200 hover:bg-purple-200">
              Atual
            </Badge>
          ) : (
            <Badge className="cursor-default bg-gray-100 text-gray-700 duration-200 hover:bg-gray-200">
              Não Possui
            </Badge>
          )}
        </div>
        <p className="text-gray-600">
          Para profissionais autônomos ou pequenas empresas.
        </p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-gray-900">R$29,90</span>
          <span className="ml-1 text-gray-600">/ mês</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 border-t border-gray-200 pt-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <p className="ml-3 text-gray-600">{feature}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {createStripeCheckoutAction.isExecuting ? (
            <Loader2 className="mr-1 flex h-4 w-4 animate-spin items-center justify-center" />
          ) : active ? (
            <Button
              className="text-md w-full cursor-pointer bg-purple-500 py-6 shadow-lg drop-shadow-purple-600 duration-200 hover:scale-[1.02] hover:bg-purple-600"
              onClick={active ? handleManagePlanClick : handleSubscribeClick}
              disabled={createStripeCheckoutAction.isExecuting}
            >
              Gerenciar assinatura
            </Button>
          ) : (
            <Button
              className="text-md w-full cursor-pointer bg-green-500 py-6 drop-shadow-purple-400 duration-200 hover:scale-[1.02] hover:bg-green-600"
              onClick={active ? handleManagePlanClick : handleSubscribeClick}
              disabled={createStripeCheckoutAction.isExecuting}
            >
              Fazer Assinatura
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

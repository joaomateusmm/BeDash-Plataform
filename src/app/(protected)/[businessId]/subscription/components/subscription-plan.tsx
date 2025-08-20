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
          <h3 className="text-2xl font-bold text-gray-900">Essential</h3>
          {active ? (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 duration-200 cursor-default">
              Atual
            </Badge>
          ) : (
            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 duration-200 cursor-default">
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
              <Loader2 className="mr-1 h-4 w-4 animate-spin flex items-center justify-center" />
            ) : active ? (
              <Button
            className="w-full bg-purple-500 hover:bg-purple-600 duration-200 hover:scale-[1.02] cursor-pointer text-md py-6 drop-shadow-purple-600 shadow-lg"
            onClick={active ? handleManagePlanClick : handleSubscribeClick}
            disabled={createStripeCheckoutAction.isExecuting}
          >
            Gerenciar assinatura
          </Button>
            ) : (
              <Button
            className="w-full bg-green-500 hover:bg-green-600 duration-200 hover:scale-[1.02] cursor-pointer text-md py-6 drop-shadow-purple-400"
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
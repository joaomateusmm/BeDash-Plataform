"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CancelledPaymentOverlayProps {
  businessId: string;
}

export function CancelledPaymentOverlay({
  businessId,
}: CancelledPaymentOverlayProps) {
  const router = useRouter();

  const handleTryAgain = () => {
    // Remove o parâmetro canceled da URL e volta para a página de assinatura
    router.push(`/${businessId}/subscription`);
  };

  const handleGoBack = () => {
    router.push(`/${businessId}/dashboard`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-md shadow-2xl">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-foreground text-xl font-bold">
            Pagamento Cancelado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Seu pagamento foi cancelado. Não se preocupe, nenhuma cobrança foi
            efetuada.
          </p>

          <div className="space-y-3">
            <Button onClick={handleTryAgain} className="w-full gap-2" size="lg">
              <CreditCard className="h-4 w-4" />
              Tentar Novamente
            </Button>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>

          <p className="text-muted-foreground text-xs">
            Precisa de ajuda? Entre em contato conosco através do suporte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

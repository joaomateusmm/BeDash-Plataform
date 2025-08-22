"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SuccessPaymentOverlayProps {
  userPlan: string | null;
  businessId: string;
}

export function SuccessPaymentOverlay({
  userPlan,
  businessId,
}: SuccessPaymentOverlayProps) {
  const router = useRouter();

  const handleGoToDashboard = () => {
    router.push(`/${businessId}/dashboard`);
  };

  const handleViewBilling = () => {
    router.push(`/${businessId}/subscription`);
  };

  // Mapear planos para configurações visuais
  const planConfigs = {
    basico: {
      name: "Básico",
      cardClass: "bg-transparent shadow-xl",
      titleClass: "text-foreground",
      textClass: "text-muted-foreground",
      iconBgClass: "bg-green-100 dark:bg-green-900/20",
      iconClass: "text-green-600 dark:text-green-400",
      sparklesClass: "text-green-500 dark:text-green-400",
    },
    profissional: {
      name: "Profissional",
      cardClass:
        "border-0 bg-gradient-to-br from-indigo-200/30 to-purple-400/50 text-white shadow-xl dark:bg-gradient-to-br dark:from-indigo-400/15 dark:to-purple-500/20",
      titleClass: "text-gray-900 dark:text-white",
      textClass: "text-gray-700 dark:text-purple-100",
      iconBgClass: "bg-white/30",
      iconClass: "text-gray-900 dark:text-white",
      sparklesClass: "text-purple-300 dark:text-purple-200",
    },
    advanced: {
      name: "Avançado",
      cardClass:
        "border-0 bg-gradient-to-br from-red-500/20 to-red-800/20 shadow-xl dark:bg-gradient-to-br dark:from-gray-600/15 dark:to-red-500/30",
      titleClass: "text-gray-900 dark:text-white",
      textClass: "text-gray-700 dark:text-red-100",
      iconBgClass: "bg-white/30",
      iconClass: "text-gray-900 dark:text-white",
      sparklesClass: "text-red-300 dark:text-red-200",
    },
    avancado: {
      name: "Avançado",
      cardClass:
        "border-0 bg-gradient-to-br from-red-500/20 to-red-800/20 shadow-xl dark:bg-gradient-to-br dark:from-gray-600/15 dark:to-red-500/30",
      titleClass: "text-gray-900 dark:text-white",
      textClass: "text-gray-700 dark:text-red-100",
      iconBgClass: "bg-white/30",
      iconClass: "text-gray-900 dark:text-white",
      sparklesClass: "text-red-300 dark:text-red-200",
    },
  };

  const currentPlan = userPlan as keyof typeof planConfigs;
  const config = planConfigs[currentPlan] || planConfigs.basico;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`mx-4 w-full max-w-md shadow-2xl ${config.cardClass}`}>
        <CardHeader className="relative pb-4 text-center">
          {/* Sparkles decorativos */}
          <div className="absolute -top-2 -left-2">
            <Sparkles className={`h-6 w-6 ${config.sparklesClass}`} />
          </div>
          <div className="absolute -top-2 -right-2">
            <Sparkles className={`h-4 w-4 ${config.sparklesClass}`} />
          </div>
          <div className="absolute -right-2 -bottom-2">
            <Sparkles className={`h-5 w-5 ${config.sparklesClass}`} />
          </div>

          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config.iconBgClass}`}
          >
            <CheckCircle className={`h-8 w-8 ${config.iconClass}`} />
          </div>
          <CardTitle className={`text-xl font-bold ${config.titleClass}`}>
            🎉 Parabéns!
          </CardTitle>
          <div className={`mt-2 text-lg font-semibold ${config.titleClass}`}>
            Agora você é um cliente{" "}
            <span className="font-bold">{config.name}</span>!
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <p className={`text-sm ${config.textClass}`}>
              Seu pagamento foi processado com sucesso e sua assinatura está
              ativa!
            </p>
            <p className={`text-sm font-medium ${config.textClass}`}>
              Bem-vindo ao nosso time exclusivo de clientes {config.name}. Você
              agora tem acesso a todos os recursos premium!
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleGoToDashboard}
              className={`w-full gap-2 ${
                currentPlan === "profissional"
                  ? "bg-white font-medium text-purple-600 hover:bg-gray-50"
                  : currentPlan === "avancado"
                    ? "bg-white font-medium text-red-600 hover:bg-gray-50"
                    : ""
              }`}
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Vamos Começar!
            </Button>

            <Button
              onClick={handleViewBilling}
              variant={
                currentPlan === "profissional" || currentPlan === "avancado"
                  ? "secondary"
                  : "outline"
              }
              className={`w-full gap-2 ${
                currentPlan === "profissional"
                  ? "border-white/30 bg-white/20 text-white hover:bg-white/30"
                  : currentPlan === "avancado"
                    ? "border-white/30 bg-white/20 text-white hover:bg-white/30"
                    : ""
              }`}
              size="lg"
            >
              <ArrowRight className="h-4 w-4" />
              Ver Detalhes da Assinatura
            </Button>
          </div>

          <p className={`text-xs ${config.textClass}`}>
            Você pode gerenciar sua assinatura a qualquer momento através do seu
            painel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

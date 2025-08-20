import { PropsWithChildren } from "react";
import { Lock, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { checkUserAccess } from "@/actions/check-user-access";

interface AccessGateProps extends PropsWithChildren {
  feature: string;
  fallbackMessage?: string;
  showTrialInfo?: boolean;
}

/**
 * Componente que controla o acesso a recursos premium
 */
export async function AccessGate({
  children,
  feature,
  fallbackMessage,
  showTrialInfo = true,
}: AccessGateProps) {
  const result = await checkUserAccess({});
  const access = result.data;

  if (!access || access.hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {showTrialInfo && access.isTrialUser && (
        <Alert className="border-gray-200 bg-gray-50">
          <Zap className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Trial ativo:</strong> Esta funcionalidade está disponível no
            seu trial, mas será bloqueada após o término. Faça upgrade para
            manter o acesso.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <Lock className="h-6 w-6 text-gray-500" />
          </div>
          <CardTitle className="text-lg text-gray-700">
            {access.isTrialUser
              ? "Funcionalidade Premium"
              : "Recurso Bloqueado"}
          </CardTitle>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant="outline">{feature}</Badge>
            {access.isTrialUser && (
              <Badge variant="secondary">Trial Ativo</Badge>
            )}
            {access.plan && (
              <Badge variant="outline" className="capitalize">
                {access.plan.replace("_", " ")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            {fallbackMessage ||
              access.message ||
              (access.isTrialUser
                ? "Este recurso estará disponível durante seu trial e requer upgrade após o término."
                : "Upgrade para um plano pago para desbloquear este recurso")}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              Ver Planos
            </Button>
            <Button size="sm">
              {access.isTrialUser ? "Garantir Acesso" : "Fazer Upgrade"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { PropsWithChildren } from "react";
import { Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { checkUserAccess } from "@/actions/check-user-access";

interface AccessGateProps extends PropsWithChildren {
  feature: string;
  fallbackMessage?: string;
}

/**
 * Componente que controla o acesso a recursos premium
 */
export async function AccessGate({
  children,
  feature,
  fallbackMessage,
}: AccessGateProps) {
  const access = await checkUserAccess();

  if (!access.hasAccess) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            <Lock className="h-6 w-6 text-gray-500" />
          </div>
          <CardTitle className="text-lg text-gray-700">
            Recurso Premium
          </CardTitle>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant="outline">{feature}</Badge>
            {access.isTrialUser && (
              <Badge variant="secondary">Trial Ativo</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4 text-sm text-gray-600">
            {fallbackMessage ||
              access.message ||
              "Upgrade para um plano pago para desbloquear este recurso"}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              Ver Planos
            </Button>
            <Button size="sm">Fazer Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

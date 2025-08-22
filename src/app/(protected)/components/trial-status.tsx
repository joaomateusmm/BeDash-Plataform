import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { auth } from "@/lib/auth";
import { getTrialStatus } from "@/helpers/trial";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";

export async function TrialStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userData = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (!userData) {
    return null;
  }

  const trialStatus = getTrialStatus(userData);

  if (!trialStatus.isActive) {
    return null;
  }

  const daysRemaining = trialStatus.daysRemaining;

  return (
    <Card className="border-primary/20 bg-primary/5 max-w-[350px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Trial Ativo</CardTitle>
          <Badge variant={daysRemaining > 5 ? "secondary" : "destructive"}>
            {daysRemaining} dias restantes
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Aproveite todos os recursos do plano Básicoitamente
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-xs">
            Trial termina em{" "}
            {trialStatus.endDate &&
              trialStatus.endDate.toLocaleDateString("pt-BR")}
          </div>
          <Button variant="outline" size="sm">
            Fazer upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

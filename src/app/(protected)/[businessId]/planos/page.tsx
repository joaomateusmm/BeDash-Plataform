import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { TrialNotificationBanner } from "@/app/(protected)/components/trial-notification-banner";
import { TrialLimitsProgress } from "@/app/(protected)/components/trial-limits-progress";
import { TrialInfoCard } from "./components/trial-info-card";
import { PlanUpgradeSection } from "./components/plan-upgrade-section";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { PageContainer } from "@/components/ui/page-container";

export default function SettingsPage() {
  return (
    <>
      <PageContainer>
        <PageBreadcrumb />
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Planos</h1>
            <p className="text-muted-foreground">
              Gerencie seu plano, trial e configurações da conta
            </p>
          </div>

          <Suspense fallback={<Skeleton className="h-20 w-full" />}>
            <TrialNotificationBanner />
          </Suspense>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Trial</CardTitle>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                    <TrialInfoCard />
                  </Suspense>
                </CardContent>
              </Card>
              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <TrialLimitsProgress showDetails />
              </Suspense>
            </div>

            <div className="space-y-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <PlanUpgradeSection />
              </Suspense>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

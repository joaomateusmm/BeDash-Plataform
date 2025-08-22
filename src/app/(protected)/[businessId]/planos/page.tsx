import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { TrialNotificationBanner } from "@/app/(protected)/components/trial-notification-banner";
import { TrialInfoCard } from "./components/trial-info-card";
import { PlanLimitsProgress } from "./components/plan-limits-progress";
import { PlanUpgradeSection } from "./components/plan-upgrade-section";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { PageContainer } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userPlan = session?.user?.plan;

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
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <TrialInfoCard />
              </Suspense>

              <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                <PlanLimitsProgress userPlan={userPlan} />
              </Suspense>
            </div>

            <div className="space-y-6">
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <PlanUpgradeSection userPlan={userPlan} />
              </Suspense>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

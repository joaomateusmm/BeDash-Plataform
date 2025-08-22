import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { TrialStatus } from "../../components/trial-status";

import { PricingSection } from "../subscription/components/pricing-section";
import { CancelledPaymentOverlay } from "./components/cancelled-payment-overlay";

const CancelledPage = async ({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) => {
  const { businessId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  // Buscar o plano do usuário diretamente do banco
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  const userPlan = user?.plan || null;

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Planos de Assinatura</PageTitle>
          <PageDescription>
            Escolha o plano ideal para sua empresa e potencialize seus
            resultados.
          </PageDescription>
          <TrialStatus />
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="relative">
          <PricingSection
            userPlan={userPlan}
            userEmail={session.user.email}
            businessId={businessId}
          />
          <CancelledPaymentOverlay businessId={businessId} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default CancelledPage;

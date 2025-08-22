import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MessageCircle, Construction, Clock } from "lucide-react";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { auth } from "@/lib/auth";

interface WhatsAppPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

const WhatsAppPage = async ({ params }: WhatsAppPageProps) => {
  const { businessId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Campanhas de WhatsApp
            </div>
          </PageTitle>
          <PageDescription>
            Crie e gerencie campanhas de WhatsApp para comunicação direta com
            seus clientes.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        {/* Overlay de fundo */}
        <div className="fixed inset-0 bg-black/50" />

        {/* Card de desenvolvimento */}
        <div className="fixed inset-0 mx-auto my-auto flex items-center justify-center p-4">
          <Card className="border-primary/20 bg-background w-full max-w-md border-2 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="bg-primary/10 rounded-full p-4">
                    <Construction className="text-primary h-12 w-12" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold">
                    Página em Desenvolvimento
                  </h3>
                  <p className="text-muted-foreground">
                    Esta funcionalidade está sendo desenvolvida e estará
                    disponível em breve.
                  </p>
                </div>

                <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Previsão de lançamento</span>
                  <Badge variant="outline" className="ml-1">
                    Em breve
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default WhatsAppPage;


import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import { PageBreadcrumb } from "@/components/page-breadcrumb";

const FunçoesPage = () => {
  return (
    <  PageContainer>
    <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageDescription>
            Liste aqui todos os clientes do seu Negócio.<br></br> Crie clientes para fazer <a className="text-purple-500 font-medium">campanhas</a> de marketing, mandando mensagens, promoções e muito mais usando nossa I.A com um clique!
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
    </PageContainer>
  );
};

export default FunçoesPage;

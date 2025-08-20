"use client";

import { usePathname } from "next/navigation";

// Definindo as categorias e suas páginas
const pageCategories = {
  "Menu Principal": [
    { title: "Dashboard", paths: ["/dashboard"] },
    { title: "Agendamentos", paths: ["/appointments"] },
    { title: "Profissionais", paths: ["/profissionais"] },
    { title: "Clientes", paths: ["/clientes"] },
    { title: "Funções", paths: ["/funcoes"] },
  ],
  Campanhas: [
    { title: "Campanhas", paths: ["/campanhas", "/campaigns"] },
    { title: "Email Marketing", paths: ["/email-marketing"] },
    { title: "SMS", paths: ["/sms"] },
  ],
  Empresa: [
    {
      title: "Configurações",
      paths: ["/clinic-form", "/settings", "/configuracoes"],
    },
    { title: "Gerenciar", paths: ["/gerenciar"] },
    { title: "Usuários", paths: ["/users", "/usuarios"] },
    { title: "Permissões", paths: ["/permissions", "/permissoes"] },
  ],
  Financeiro: [
    { title: "Assinatura", paths: ["/subscription", "/assinatura"] },
    { title: "Planos", paths: ["/planos", "/plans"] },
    { title: "Faturas", paths: ["/invoices", "/faturas"] },
    { title: "Pagamentos", paths: ["/payments", "/pagamentos"] },
  ],
};

export function PageBreadcrumb() {
  const pathname = usePathname();

  // Remover o businessId dinâmico da URL para comparação
  const cleanPathname = pathname.replace(/^\/[^\/]+/, "");

  let groupName = "Menu Principal";
  let pageTitle = "Página";

  // Buscar em qual categoria a página atual está
  for (const [category, pages] of Object.entries(pageCategories)) {
    const foundPage = pages.find((page) =>
      page.paths.some((path) => cleanPathname.startsWith(path)),
    );

    if (foundPage) {
      groupName = category;
      pageTitle = foundPage.title;
      break;
    }
  }

  return (
    <div className="flex items-center">
      <p className="text-muted-foreground text-sm">
        {groupName}{" "}
        <a className="text-sm font-medium text-purple-500">
          {">"} {pageTitle}
        </a>
      </p>
    </div>
  );
}

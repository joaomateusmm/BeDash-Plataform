"use client";

import { usePathname } from "next/navigation";

const menuPrincipalItems = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Agendamentos", url: "/appointments" },
  { title: "Profissionais", url: "/profissionais" },
  { title: "Clientes", url: "/clientes" },
  { title: "Funções", url: "/funcoes" },
];

const outrosItems = [
  { title: "Assinatura", url: "/subscription" }
];

export function PageBreadcrumb() {
  const pathname = usePathname();
  
  // Verificar em qual grupo a página atual está
  const menuPrincipalItem = menuPrincipalItems.find(item => pathname.startsWith(item.url));
  const outrosItem = outrosItems.find(item => pathname.startsWith(item.url));
  
  let groupName = "";
  let pageTitle = "";
  
  if (menuPrincipalItem) {
    groupName = "Menu Principal";
    pageTitle = menuPrincipalItem.title;
  } else if (outrosItem) {
    groupName = "Outros";
    pageTitle = outrosItem.title;
  } else {
    groupName = "Menu Principal";
    pageTitle = "Página";
  }

  return (
    <div className="flex items-center">
      <p className="text-muted-foreground text-sm">{groupName} <a className="text-sm text-purple-500 font-medium">{'>'} {pageTitle}</a></p>
    </div>
  );
}
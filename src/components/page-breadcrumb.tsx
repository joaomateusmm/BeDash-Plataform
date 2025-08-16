"use client";

import { usePathname } from "next/navigation";

const items = [
  { title: "Dashboard", url: "/dashboard" },
  { title: "Agendamentos", url: "/appointments" },
  { title: "Profissionais", url: "/doctors" },
  { title: "Clientes", url: "/patients" },
];

export function PageBreadcrumb() {
  const pathname = usePathname();
  const currentItem = items.find(item => pathname.startsWith(item.url));
  const pageTitle = currentItem?.title || "Página";

  return (
    <div className="flex items-center">
      <p className="text-muted-foreground text-sm">Menu Principal <a className="text-sm text-purple-500 font-medium">{'>'} {pageTitle}</a></p>
    </div>
  );
}
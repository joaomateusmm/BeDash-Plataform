"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  UsersRound,
  Briefcase,
  Diamond,
  Gem,
  Blocks,
  MessageCircle,
  Mail,
  Waypoints,
  Building2,
  Settings,
  Layers,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useActiveBusiness } from "@/contexts/active-business-context";
import { BusinessSwitcher } from "./business-switcher";
import { BadgeNew } from "./badge-new";
import { BadgeBeta } from "./badge-beta";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    version: "Alfa",
  },
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: CalendarDays,
    version: "Alfa",
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: UsersRound,
    version: "Alfa",
  },
  {
    title: "Profissionais",
    url: "/profissionais",
    icon: Briefcase,
    version: "Alfa",
  },
  {
    title: "Funções",
    url: "/funcoes",
    icon: Blocks,
    version: "Alfa",
  },
];

const itemsOutros = [
  {
    title: "Assinaturas",
    url: "/subscription",
    icon: Gem,
    version: "New",
  },
  {
    title: "Planos",
    url: "/planos",
    icon: Layers,
    version: "New",
  },
];

const itemsCampanhas = [
  {
    title: "WhatsApp",
    url: "/campanhas",
    icon: MessageCircle,
    version: "Beta",
  },
  {
    title: "Email",
    url: "/campanhas",
    icon: Mail,
    version: "Beta",
  },
  {
    title: "Personalizado",
    url: "/campanhas",
    icon: Waypoints,
    version: "Beta",
  },
];

const itemsEmpresa = [
  {
    title: "Gerenciar",
    url: "/gerenciar",
    icon: Building2,
    version: "Beta",
  },
];

export function AppSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();
  const { activeBusiness } = useActiveBusiness();

  // Extrair businessId da URL atual
  const businessId = pathname.split("/")[1];

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };

  // Usar o nome da empresa ativa do contexto, ou fallback para a sessão
  const businessName =
    activeBusiness?.name || session.data?.user?.clinic?.name || "";

  // Gerar iniciais do nome da empresa
  const businessInitials =
    businessName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase() || "";

  // Função para construir URLs com businessId
  const buildUrl = (path: string) => {
    return businessId ? `/${businessId}${path}` : path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Image
          onClick={() => router.push(buildUrl("/dashboard"))}
          className="cursor-pointer"
          src="/logolight.svg"
          alt="Be.Dash"
          width={136}
          height={28}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground my-2 text-sm font-normal opacity-70">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mb-2 flex items-center justify-between">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem
                    className="text-muted-foreground flex flex-row-reverse gap-5 text-sm font-medium"
                    key={item.title}
                  >
                    <SidebarMenuButton
                      className="py-2 duration-300"
                      asChild
                      isActive={pathname.includes(item.url)}
                    >
                      <Link href={buildUrl(item.url)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground my-2 text-sm font-normal opacity-70">
            Campanhas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsCampanhas.map((item) => (
                <SidebarMenuItem
                  className="text-muted-foreground flex flex-row-reverse items-center gap-5 py-0 text-sm font-medium"
                  key={item.title}
                >
                  <BadgeBeta />
                  <SidebarMenuButton
                    className="py-2 whitespace-nowrap duration-300"
                    asChild
                    isActive={pathname.includes(item.url)}
                  >
                    <Link href={buildUrl(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground my-2 text-sm font-normal opacity-70">
            Empresa
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsEmpresa.map((item) => (
                <SidebarMenuItem
                  className="text-muted-foreground flex flex-row-reverse items-center gap-5 py-0 text-sm font-medium"
                  key={item.title}
                >
                  <BadgeNew />
                  <SidebarMenuButton
                    className="py-2 duration-300"
                    asChild
                    isActive={pathname.includes(item.url)}
                  >
                    <Link href={buildUrl(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground my-2 text-sm font-normal opacity-70">
            Financeiro
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemsOutros.map((item) => (
                <SidebarMenuItem
                  className="text-muted-foreground flex flex-row-reverse items-center gap-5 py-1 text-sm font-medium"
                  key={item.title}
                >
                  <SidebarMenuButton
                    className="py-2 duration-300"
                    asChild
                    isActive={pathname.includes(item.url)}
                  >
                    <Link href={buildUrl(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback className="drop-shadow-md">
                      {businessInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {businessName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <BusinessSwitcher />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

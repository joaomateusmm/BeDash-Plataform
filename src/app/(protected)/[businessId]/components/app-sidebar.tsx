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
  HeartHandshake,
  MessageCircleQuestionMark,
  Flag,
  BrainCircuit,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

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
import { BadgeNewFunction } from "./badge-function";
import { Separator } from "@radix-ui/react-separator";
import { getPlanInfo } from "@/helpers/plan-info";

// Interface para os itens do menu
interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType;
  badge?: "new" | "beta" | "function";
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: CalendarDays,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: UsersRound,
  },
  {
    title: "Profissionais",
    url: "/profissionais",
    icon: Briefcase,
  },
  {
    title: "Funções",
    url: "/funcoes",
    icon: Blocks,
  },
];

const itemsFinanceiro: MenuItem[] = [
  {
    title: "Assinaturas",
    url: "/subscription",
    icon: Gem,
  },
  {
    title: "Planos",
    url: "/planos",
    icon: Layers,
  },
];

const itemsCampanhas: MenuItem[] = [
  {
    title: "WhatsApp",
    url: "/whatsapp",
    icon: MessageCircle,
    badge: "beta", // Exemplo: badge beta no WhatsApp
  },
  {
    title: "Email",
    url: "/email",
    icon: Mail,
    badge: "beta", // Badge beta no Email
  },
  {
    title: "Personalizado",
    url: "/personalizado",
    icon: Waypoints,
    badge: "beta", // Badge beta no Personalizado
  },
  {
    title: "Agente de IA",
    url: "/agente",
    icon: BrainCircuit,
    badge: "new", 
  },
];

const itemsEmpresa: MenuItem[] = [
  {
    title: "Gerenciar",
    url: "/gerenciar",
    icon: Building2,
  },
];

const itemsOutros: MenuItem[] = [
  {
    title: "Contato",
    url: "/contato",
    icon: MessageCircleQuestionMark,
  },
  {
    title: "Suporte",
    url: "/suporte",
    icon: HeartHandshake,
  },
  {
    title: "Sobre",
    url: "/sobre",
    icon: Flag,
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();
  const { activeBusiness } = useActiveBusiness();
  const { theme } = useTheme();

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

  // Obter o plano do usuário e suas informações de estilo
  const userPlan = session.data?.user?.plan || null;
  const planInfo = getPlanInfo(userPlan);

  // Função para gerar o background do footer baseado no plano
  const getFooterBackground = () => {
    if (!userPlan || userPlan.includes("trial")) {
      return "";
    }

    switch (userPlan) {
      case "basico":
        return "";
      case "profissional":
        return "bg-gradient-to-r from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20";
      case "avancado":
        return "bg-gradient-to-r from-orange-50 to-red-100 dark:from-gray-800/20 dark:to-red-900/30";
      default:
        return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20";
    }
  };

  // Função para construir URLs com businessId
  const buildUrl = (path: string) => {
    return businessId ? `/${businessId}${path}` : path;
  };

  // Função para definir a logo baseada no tema
  const getLogo = () => {
    if (theme === "dark") {
      return "/logodark.svg";
    }
    return "/logolight.svg";
  };

  // Função para renderizar o badge correto
  const renderBadge = (badgeType?: string) => {
    if (!badgeType) return null;

    switch (badgeType) {
      case "new":
        return <BadgeNew />;
      case "beta":
        return <BadgeBeta />;
      case "function":
        return <BadgeNewFunction />;
      default:
        return null;
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <Image
          onClick={() => router.push(buildUrl("/dashboard"))}
          className="cursor-pointer"
          src={getLogo()}
          alt="Be.Dash"
          width={136}
          height={28}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground my-0 text-sm font-normal opacity-70">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center justify-between">
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem
                    className="text-muted-foreground flex flex-row-reverse gap-2 text-sm font-medium"
                    key={item.title}
                  >
                    {item.badge && <div>{renderBadge(item.badge)}</div>}
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
        {/* Grupo campanhas */}
        <div className="mt-[-15px]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground my-0 text-sm font-normal opacity-70">
              Campanhas
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {itemsCampanhas.map((item) => (
                  <SidebarMenuItem
                    className="text-muted-foreground flex flex-row-reverse items-center gap-2 py-0 text-sm font-medium"
                    key={item.title}
                  >
                    {item.badge && <div>{renderBadge(item.badge)}</div>}
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
        </div>
        {/* Grupo empresa */}
        <div className="mt-[-15px]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground my-0 text-sm font-normal opacity-70">
              Empresa
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {itemsEmpresa.map((item) => (
                  <SidebarMenuItem
                    className="text-muted-foreground flex flex-row-reverse items-center gap-2 py-0 text-sm font-medium"
                    key={item.title}
                  >
                    {item.badge && <div>{renderBadge(item.badge)}</div>}
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
        </div>
        {/* Grupo financeiro */}
        <div className="mt-[-15px]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground my-0 text-sm font-normal opacity-70">
              Financeiro
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {itemsFinanceiro.map((item) => (
                  <SidebarMenuItem
                    className="text-muted-foreground flex flex-row-reverse items-center gap-2 text-sm font-medium"
                    key={item.title}
                  >
                    {item.badge && <div>{renderBadge(item.badge)}</div>}
                    <SidebarMenuButton
                      className="py-0 duration-300"
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
        </div>
        {/* Grupo outros */}
        <div className="mt-[-15px]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground my-2 text-sm font-normal opacity-70">
              Outros
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="mb-2 flex items-center justify-between">
                <SidebarMenu>
                  {itemsOutros.map((item) => (
                    <SidebarMenuItem
                      className="text-muted-foreground flex flex-row-reverse gap-2 text-sm font-medium"
                      key={item.title}
                    >
                      {item.badge && <div>{renderBadge(item.badge)}</div>}
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
        </div>
      </SidebarContent>
      {/* Perfil do Usuário */}
      <Separator />
      <SidebarFooter
        className={`transition-all duration-300 ${getFooterBackground()}`}
      >
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

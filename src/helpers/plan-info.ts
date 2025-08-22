export interface PlanLimits {
  companies: number | "unlimited";
  professionals: number | "unlimited";
  functions: number | "unlimited";
  appointments: number | "unlimited";
  clients: number | "unlimited";
}

export interface PlanInfo {
  name: string;
  type: "basico_trial" | "basico" | "profissional" | "avancado";
  cardClass: string;
  titleClass: string;
  textClass: string;
  iconBgClass: string;
  iconClass: string;
  sparklesClass: string;
  limits: PlanLimits;
  features: string[];
}

export function getPlanInfo(planType: string | null): PlanInfo {
  const planConfigs: Record<string, PlanInfo> = {
    basico_trial: {
      name: "Básico Trial",
      type: "basico_trial",
      cardClass:
        "bg-gradient-to-br from-blue-50 to-blue-100 dark:bg-gradient-to-br dark:from-blue-950/30 dark:to-blue-900/30",
      titleClass: "text-blue-900 dark:text-blue-100",
      textClass: "text-blue-700 dark:text-blue-200",
      iconBgClass: "bg-blue-100 dark:bg-blue-900/30",
      iconClass: "text-blue-600 dark:text-blue-400",
      sparklesClass: "text-blue-500 dark:text-blue-400",
      limits: {
        companies: 1,
        professionals: 10,
        functions: 10,
        appointments: 100,
        clients: 100,
      },
      features: [
        "Cadastro de até 1 Empresa",
        "Até 10 profissionais",
        "Até 10 funções",
        "100 Agendamentos por mês",
        "100 Clientes por mês",
        "Suporte Completo",
      ],
    },
    basico: {
      name: "Básico",
      type: "basico",
      cardClass:
        "bg-transparent",
      titleClass: "text-gray-800 dark:text-white",
      textClass: "text-gray-800 dark:text-white",
      iconBgClass: "bg-gray-100",
      iconClass: "text-gray-600 dark:text-white",
      sparklesClass: "text-gray-500 dark:text-white",
      limits: {
        companies: 1,
        professionals: 10,
        functions: 10,
        appointments: 100,
        clients: 100,
      },
      features: [
        "Cadastro de até 1 Empresa",
        "Até 10 profissionais",
        "Até 10 funções",
        "100 Agendamentos por mês",
        "100 Clientes por mês",
        "Campanhas de WhatsApp e Email",
        "Suporte Completo",
      ],
    },
    profissional: {
      name: "Profissional",
      type: "profissional",
      cardClass:
        "bg-gradient-to-br from-indigo-200/30 to-purple-400/50 dark:bg-gradient-to-br dark:from-indigo-400/15 dark:to-purple-500/20",
      titleClass: "text-gray-900 dark:text-white",
      textClass: "text-gray-700 dark:text-purple-100",
      iconBgClass: "bg-white/30",
      iconClass: "text-gray-900 dark:text-white",
      sparklesClass: "text-purple-300 dark:text-purple-200",
      limits: {
        companies: 3,
        professionals: 50,
        functions: 50,
        appointments: 500,
        clients: 500,
      },
      features: [
        "Cadastro de até 3 Empresas",
        "Nosso Agente de I.A",
        "Até 50 profissionais",
        "Até 50 funções",
        "500 Clientes por mês",
        "500 Agendamentos por mês",
        "Campanhas personalizadas",
        "Suporte prioritário",
      ],
    },
    avancado: {
      name: "Avançado",
      type: "avancado",
      cardClass:
        "bg-gradient-to-br from-red-500/20 to-red-800/20 dark:bg-gradient-to-br dark:from-gray-600/15 dark:to-red-500/30",
      titleClass: "text-gray-900 dark:text-white",
      textClass: "text-gray-700 dark:text-red-100",
      iconBgClass: "bg-white/30",
      iconClass: "text-gray-900 dark:text-white",
      sparklesClass: "text-red-300 dark:text-red-200",
      limits: {
        companies: 10,
        professionals: "unlimited",
        functions: "unlimited",
        appointments: "unlimited",
        clients: "unlimited",
      },
      features: [
        "Cadastro de até 10 Empresas",
        "Nosso Agente de I.A",
        "Profissionais Ilimitados",
        "Funções Ilimitadas",
        "Clientes Ilimitados",
        "Agendamentos Ilimitados",
        "Campanhas personalizadas",
        "Suporte prioritário",
      ],
    },
  };

  return planConfigs[planType || "basico_trial"] || planConfigs.basico_trial;
}

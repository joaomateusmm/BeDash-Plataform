import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  HelpCircle,
  BookOpen,
  Settings,
  Zap,
  Send,
  ExternalLink,
  Layers,
  Building2,
  Briefcase,
  UsersRound,
  LayoutDashboard,
  CalendarDays,
  Waypoints,
  BrainCircuit,
} from "lucide-react";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { auth } from "@/lib/auth";

interface SuportePageProps {
  params: Promise<{
    businessId: string;
  }>;
}

const SuportePage = async ({ params }: SuportePageProps) => {
  const { businessId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const faqData = [
    {
      question: "Como cadastrar meus primeiros clientes?",
      answer:
        "Para cadastrar clientes, vá até a página 'Clientes' no menu lateral e clique em 'Adicionar Cliente'. Preencha as informações básicas como nome, email, telefone e sexo. Essas informações são importantes para criar campanhas de marketing personalizadas e manter um bom relacionamento com seus clientes.",
    },
    {
      question: "Como funciona o sistema de agendamentos?",
      answer:
        "O sistema de agendamentos permite que você organize todos os serviços da sua empresa. Acesse a página 'Agendamentos' para criar novos agendamentos, definir horários, associar clientes e profissionais. Você pode visualizar todos os agendamentos em um calendário organizado e receber notificações importantes.",
    },
    {
      question: "Posso adicionar outros profissionais à minha conta?",
      answer:
        "Sim! Na página 'Profissionais', você pode cadastrar todos os profissionais da sua equipe. Cada profissional pode ter suas próprias especialidades, horários de trabalho e agendamentos. Isso permite uma gestão completa da sua equipe em um só lugar.",
    },
    {
      question: "Como funcionam as campanhas de marketing?",
      answer:
        "As campanhas de marketing permitem enviar mensagens personalizadas via WhatsApp e Email para seus clientes. Você pode criar campanhas promocionais, lembretes de consultas e comunicados importantes. A IA da plataforma ajuda a personalizar as mensagens para cada cliente, aumentando o engajamento.",
    },
    {
      question: "Qual a diferença entre o trial e o plano pago?",
      answer:
        "O trial gratuito permite testar todas as funcionalidades por um período limitado, com restrições de quantidade (100 clientes, 10 profissionais, etc.). O plano pago remove essas limitações e oferece recursos avançados como campanhas ilimitadas, suporte prioritário e relatórios detalhados.",
    },
    {
      question: "Como alterar as informações da minha empresa?",
      answer:
        "Acesse a página 'Gerenciar' no menu para editar todas as informações da sua empresa, incluindo nome, descrição, dados de contato e configurações gerais. Você também pode visualizar métricas importantes e indicadores de performance da sua empresa.",
    },
    {
      question: "É possível gerenciar múltiplas empresas?",
      answer:
        "Sim! Você pode cadastrar e alternar entre diferentes empresas usando o seletor no rodapé da barra lateral. Cada empresa tem seus próprios clientes, profissionais, agendamentos e configurações independentes, mas lembrando, o uso de mais de 1 empresa so pode ser feita no plano Profissional.",
    },
    {
      question: "Como funciona o sistema de cobrança?",
      answer:
        "A cobrança é feita mensalmente de forma automática via cartão de crédito. Você pode gerenciar sua assinatura, visualizar faturas e alterar método de pagamento na página 'Planos'. O sistema é transparente e você recebe todas as informações por email.",
    },
    {
      question: "Meus dados estão seguros na plataforma?",
      answer:
        "Absolutamente! Utilizamos criptografia de ponta a ponta, servidores seguros e seguimos as melhores práticas de segurança. Todos os dados são armazenados de forma segura e você tem controle total sobre suas informações. Também estamos em conformidade com a LGPD.",
    },
    {
      question: "Como posso cancelar minha assinatura?",
      answer:
        "Você pode cancelar sua assinatura a qualquer momento através da página 'Planos' ou entrando em contato com nosso suporte. Após o cancelamento, você continuará tendo acesso até o fim do período pago e poderá exportar seus dados.",
    },
    {
      question: "Existe suporte técnico disponível?",
      answer:
        "Sim! Oferecemos suporte via email, WhatsApp e através desta central de ajuda. Para planos pagos, temos suporte prioritário com resposta em até 2 horas durante horário comercial. Nossa equipe está sempre pronta para ajudar!",
    },
    {
      question: "Posso personalizar a interface da plataforma?",
      answer:
        "Sim! Na página 'Configurações', você pode alternar entre tema claro e escuro, além de personalizar algumas preferências da interface. Estamos constantemente adicionando novas opções de personalização baseadas no feedback dos usuários.",
    },
  ];

  const pageHelpers = [
    {
      page: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      description:
        "Visão geral dos seus agendamentos, clientes ativos e métricas principais da sua empresa.",
    },
    {
      page: "Agendamentos",
      icon: <CalendarDays className="h-4 w-4" />,
      description:
        "Gerencie todos os agendamentos, horários e compromissos da sua empresa em um calendário organizado.",
    },
    {
      page: "Clientes",
      icon: <UsersRound className="h-4 w-4" />,
      description:
        "Cadastre e gerencie sua base de clientes. Crie campanhas de marketing personalizadas para fidelizar clientes.",
    },
    {
      page: "Profissionais",
      icon: <Briefcase className="h-4 w-4" />,
      description:
        "Adicione e gerencie os profissionais da sua equipe, definindo especialidades e horários de trabalho.",
    },
    {
      page: "Gerenciar",
      icon: <Building2 className="h-4 w-4" />,
      description:
        "Centro de controle da sua empresa com métricas avançadas, informações da empresa e análises de performance.",
    },
    {
      page: "Planos",
      icon: <Layers className="h-4 w-4" />,
      description:
        "Gerencie sua assinatura, visualize faturas e faça upgrade para desbloquear recursos avançados.",
    },
    {
      page: "Configurações",
      icon: <Settings className="h-4 w-4" />,
      description:
        "Personalize sua conta, altere temas da interface e gerencie suas preferências pessoais.",
    },
    {
      page: "Personalizado",
      icon: <Waypoints className="h-4 w-4" />,
      description:
        "Crie campanhas de marketing e venda personalizado para os seus clientes, seja por email ou whatsapp usando nossa I.A",
    },
  ];

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Central de Suporte</PageTitle>
          <PageDescription>
            Encontre respostas para suas dúvidas, acesse tutoriais e entre em
            contato com nossa equipe de suporte especializada.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-8">
          {/* Seção de Contato Rápido */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20 bg-primary/5 hidden">
              <CardHeader className="text-center">
                <BrainCircuit className="text-primary mx-auto h-8 w-8" />
                <CardTitle className="text-lg">Chat com nossa I.A</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Converse com nosso agente de I.A 24 horas.
                </p>
                <Button className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="text-primary mx-auto h-8 w-8" />
                <CardTitle className="text-lg">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Resposta em até 2 horas
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  suporte@bedash.com.br
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Phone className="text-primary mx-auto h-8 w-8" />
                <CardTitle className="text-lg">WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  Suporte via WhatsApp
                </p>
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  (11) 99999-9999
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Horários de Atendimento */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="text-primary h-5 w-5" />
                <CardTitle>Horários de Atendimento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium">Suporte Geral</h4>
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <p>Segunda a Sexta: 9h às 18h</p>
                    <p>Sábado: 9h às 14h</p>
                    <p>Domingo: Fechado</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-medium">
                    Suporte Prioritário
                    <Badge className="bg-primary/10 text-primary">
                      Premium
                    </Badge>
                  </h4>
                  <div className="text-muted-foreground space-y-1 text-sm">
                    <p>Segunda a Domingo: 24h</p>
                    <p>Resposta garantida em 30min</p>
                    <p>Apenas planos pagos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guia Rápido das Páginas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="text-primary h-5 w-5" />
                <CardTitle>Guia Rápido das Funcionalidades</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {pageHelpers.map((helper, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="text-primary">{helper.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{helper.page}</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <HelpCircle className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="flex items-center gap-2 font-medium">
                                {helper.icon}
                                {helper.page}
                              </h4>
                              <p className="text-muted-foreground text-sm">
                                {helper.description}
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {helper.description.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="text-primary h-5 w-5" />
                <CardTitle>Perguntas Frequentes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SuportePage;

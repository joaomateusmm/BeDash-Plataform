import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Phone,
  MapPin,
  Clock,
  Send,
  User,
  MessageSquare,
  Tag,
  CheckCircle,
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
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { auth } from "@/lib/auth";
import { ContactForm } from "./components/contact-form";

interface ContatoPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

const ContatoPage = async ({ params }: ContatoPageProps) => {
  const { businessId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      value: "contato@bedash.com.br",
      description: "Resposta em até 2 horas",
      action: "mailto:bedashcontato@gmail.com",
      primary: false,
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "WhatsApp",
      value: "(11) 99999-9999",
      description: "Atendimento instantâneo",
      action: "https://wa.me/5511999999999",
      primary: false,
    },
  ];

  const socialMedia = [
    {
      icon: <Instagram className="h-5 w-5" />,
      name: "Instagram",
      handle: "@bedash",
      url: "https://instagram.com/bedash",
    },
    {
      icon: <Facebook className="h-5 w-5" />,
      name: "Facebook",
      handle: "BeDash",
      url: "https://facebook.com/bedash",
    },
  ];

  const features = [
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: "Suporte técnico especializado",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: "Resposta rápida e eficiente",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: "Atendimento humanizado",
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: "Soluções personalizadas",
    },
  ];

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Entre em Contato</PageTitle>
          <PageDescription>
            Estamos aqui para ajudar! Entre em contato conosco através dos
            canais abaixo ou envie uma mensagem usando o formulário.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-8">
          {/* Hero Section com Informações de Contato */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-primary h-6 w-6" />
                  Fale Conosco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {contactInfo.map((contact, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${
                        contact.primary
                          ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                          : "border-border hover:bg-muted/25"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          contact.primary
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {contact.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">
                            {contact.title}
                          </h4>
                          {contact.primary && (
                            <Badge className="bg-primary/10 text-primary">
                              Prioritário
                            </Badge>
                          )}
                        </div>
                        <p className="text-foreground mt-1 text-sm font-medium">
                          {contact.value}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {contact.description}
                        </p>
                        {contact.action && (
                          <a
                            href={contact.action}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="default"
                              className="mt-4 duration-300 hover:scale-[1.02] hover:bg-purple-700"
                            >
                              Contatar
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Redes Sociais */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">
                    Siga-nos nas Redes Sociais
                  </h4>
                  <div className="flex gap-3">
                    {socialMedia.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-muted/25 flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
                      >
                        <div className="text-primary">{social.icon}</div>
                        <div>
                          <p className="text-sm font-medium">{social.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {social.handle}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Horários e Recursos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-primary h-6 w-6" />
                  Horário de Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Suporte Online
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Segunda a Sexta:</span> 9h
                        às 18h
                      </p>
                      <p>
                        <span className="font-medium">Sábado:</span> 9h às 14h
                      </p>
                      <p>
                        <span className="font-medium">Domingo:</span> Fechado
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 text-sm font-semibold">WhatsApp</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Segunda a Domingo:</span>{" "}
                        24h
                      </p>
                      <p className="text-muted-foreground">
                        Resposta automática e suporte via IA
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">
                    Por que nos escolher?
                  </h4>
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {feature.icon}
                        {feature.text}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="text-primary h-6 w-6" />
                  Envie sua Mensagem
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  Preencha o formulário abaixo e entraremos em contato em até 2
                  horas úteis.
                </p>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="mx-auto my-auto p-6 text-center">
                <div className="mx-auto my-auto space-y-4">
                  <MessageSquare className="text-primary mx-auto h-12 w-12" />
                  <h3 className="text-xl font-bold">
                    Precisa de Ajuda Rápida?
                  </h3>
                  <p className="text-muted-foreground mx-auto max-w-2xl">
                    Visite nossa central de suporte para encontrar respostas
                    para as perguntas mais frequentes e tutoriais detalhados
                    sobre como usar a plataforma.
                  </p>
                  <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                    <Button asChild>
                      <a href={`/${businessId}/suporte`}>Central de Suporte</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href="https://wa.me/5511999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp Direto
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ContatoPage;

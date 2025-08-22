import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Target,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Mail,
  MessageCircle,
  Instagram,
  Facebook,
  Star,
  Award,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Globe,
  Handshake,
} from "lucide-react";

import Image from "next/image";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { auth } from "@/lib/auth";
import { ThemeAwareLogo } from "./components/theme-aware-logo";

interface SobrePageProps {
  params: Promise<{
    businessId: string;
  }>;
}

const SobrePage = async ({ params }: SobrePageProps) => {
  const { businessId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const stats = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "10+",
      subtitle: "Empresas Atendidas",
      description: "Pequenos e médios negócios crescendo conosco",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "247%",
      subtitle: "Crescimento Médio",
      description: "Aumento na organização dos nossos clientes",
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "4.9/5",
      subtitle: "Satisfação",
      description: "Avaliação média dos nossos usuários",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "24/7",
      subtitle: "Suporte",
      description: "Suporte humanizado e I.A sempre disponível.",
    },
  ];

  const values = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Paixão pelo Cliente",
      description:
        "Cada decisão que tomamos tem o cliente no centro. Seu sucesso é nossa motivação.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Confiabilidade",
      description:
        "Protegemos seus dados com segurança de nível bancário e disponibilidade 99.9%.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Inovação",
      description:
        "Sempre evoluindo com as últimas tecnologias para oferecer a melhor experiência.",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Simplicidade",
      description:
        "Transformamos complexidade em simplicidade, tornando a gestão intuitiva e eficaz.",
    },
  ];

  const team = [
    {
      name: "Ana Silva",
      role: "CEO & Fundadora",
      image: "",
      description:
        "Empreendedora serial com 15 anos de experiência em gestão de negócios",
    },
    {
      name: "Carlos Santos",
      role: "CTO",
      image: "",
      description:
        "Especialista em desenvolvimento de software e arquitetura de sistemas",
    },
    {
      name: "Marina Costa",
      role: "Head de Produto",
      image: "",
      description: "Designer UX/UI apaixonada por criar experiências incríveis",
    },
    {
      name: "Roberto Lima",
      role: "Head de Customer Success",
      image: "",
      description:
        "Focado em garantir o sucesso e satisfação dos nossos clientes",
    },
  ];

  const features = [
    "Gestão completa de clientes e agendamentos",
    "Campanhas de marketing automatizadas",
    "Relatórios e analytics avançados",
    "Integração com redes sociais",
    "Suporte técnico especializado",
    "Segurança de dados garantida",
  ];

  return (
    <PageContainer>
      <PageBreadcrumb />
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Sobre Nós</PageTitle>
          <PageDescription>
            Conheça nossa história, missão e os valores que nos movem a
            transformar pequenos e médios negócios.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="relative overflow-hidden">
            <Card className="border-primary/20 from-primary/5 via-primary/3 bg-gradient-to-br to-transparent">
              <CardContent className="p-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="space-y-2">
                      <Badge className="bg-primary/10 text-primary">
                        Nossa Missão
                      </Badge>
                      <h2 className="text-3xl font-bold tracking-tight">
                        Automatizar a gestão profissional
                      </h2>
                      <p className="text-muted-foreground text-xl">
                        Acreditamos que todo empreendedor merece ter acesso às
                        melhores ferramentas de gestão, independentemente do
                        tamanho da sua empresa.
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Link href={`/${businessId}/subscription`}>
                        <Button size="lg" className="group">
                          Comece agora
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                      <Link href={`/${businessId}/contato`}>
                        <Button variant="outline" size="lg">
                          Fale conosco
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="from-primary/20 to-primary/5 relative aspect-square rounded-2xl bg-gradient-to-br p-8">
                      <div className="bg-grid-pattern absolute inset-0 opacity-10"></div>
                      <div className="relative z-10 flex h-full items-center justify-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="mx-auto duration-1000 hover:scale-105">
                            <ThemeAwareLogo
                              alt="BeDash"
                              width={300}
                              height={300}
                            />
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Automatizando gestão de empresas.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-transparent text-center duration-1000 hover:scale-105 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="text-primary mb-4 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{stat.title}</div>
                    <div className="text-primary font-semibold">
                      {stat.subtitle}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Nossa História */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="text-primary h-6 w-6" />
                Nossa História
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="leading-relaxed">
                  Nascemos da frustração de ver tantos empreendedores talentosos
                  lutando com ferramentas complicadas e caras para gerenciar
                  seus negócios. Em 2025, decidimos mudar esse cenário.Nossa
                  jornada começou quando percebemos que as soluções existentes
                  no mercado eram ou muito simples para crescer junto com o
                  negócio, ou muito complexas e caras para pequenas empresas.
                  Decidimos criar algo diferente: uma plataforma poderosa, mas
                  simples, e com preço justo. Hoje, orgulhosamente servimos mais
                  de 10 empresas em todo o Brasil, desde consultórios médicos
                  até salões de beleza, desde pequenos negócios até empresas de
                  serviços em crescimento.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-4 w-4 text-green-500" />O que
                    oferecemos
                  </h4>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <Target className="text-primary h-4 w-4" />
                    Nosso Objetivo
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Democratizar o acesso a ferramentas profissionais de gestão,
                    permitindo que pequenos e médios empreendedores tenham as
                    mesmas vantagens competitivas que grandes corporações, mas
                    com a simplicidade e preço que seu negócio merece.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="text-primary h-6 w-6" />
                Nossos Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {values.map((value, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0 rounded-lg p-3 duration-300 hover:scale-105">
                      {value.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold">{value.title}</h4>
                      <p className="text-muted-foreground text-sm">
                        {value.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipe */}
          <Card className="hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-primary h-6 w-6" />
                Nossa Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {team.map((member, index) => (
                  <div key={index} className="space-y-4 text-center">
                    <Avatar className="mx-auto h-20 w-20">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback className="text-lg">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h4 className="font-semibold">{member.name}</h4>
                      <Badge variant="secondary">{member.role}</Badge>
                      <p className="text-muted-foreground text-xs">
                        {member.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-center">Conecte-se Conosco</CardTitle>
              <p className="text-muted-foreground text-center">
                Siga-nos nas redes sociais e fique por dentro das novidades
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button variant="outline" className="group">
                  <Mail className="mr-2 h-4 w-4" />
                  contato@bedash.com.br
                </Button>
                <Button variant="outline" className="group">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" className="group">
                  <Instagram className="mr-2 h-4 w-4" />
                  @bedash
                </Button>
                <Button variant="outline" className="group">
                  <Facebook className="mr-2 h-4 w-4" />
                  BeDash
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Tem alguma dúvida ou sugestão? Adoramos ouvir nossos usuários!
                </p>
                <div className="flex justify-center gap-4">
                  <Link href={`/${businessId}/contato`}>
                    <Button>
                      Fale Conosco
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/${businessId}/suporte`}>
                    <Button variant="outline">Central de Ajuda</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Final */}
          <Card className="from-primary/10 via-primary/5 to-primary/10 border-primary/20 bg-gradient-to-r">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <Sparkles className="text-primary mx-auto h-12 w-12" />
                <h3 className="text-2xl font-bold">
                  Pronto para Transformar seu Negócio?
                </h3>
                <p className="text-muted-foreground mx-auto max-w-2xl">
                  Junte-se a milhares de empreendedores que já descobriram como
                  é fácil gerenciar um negócio com as ferramentas certas. Comece
                  seu teste gratuito hoje mesmo!
                </p>
                <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                  <Link href={`/${businessId}/subscription`}>
                    <Button size="lg" className="group">
                      Automatizar Minha Empresa
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SobrePage;

"use client";

import { useState } from "react";
import {
  Activity,
  Baby,
  Binoculars,
  Bone,
  Brain,
  Briefcase,
  Bubbles,
  CircleUserRound,
  Eye,
  EyeClosed,
  Footprints,
  Hand,
  Heart,
  Hospital,
  Scissors,
  Stethoscope,
  Trash,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Importar os componentes de gráfico
import { ChartPieLabel } from "./charts-especialidades/pizza-chart";
import { ChartRadarDots } from "./charts-especialidades/radar-chart";
import { ChartBarHorizontal } from "./charts-especialidades/bar-horizontal-char";

interface TopSpecialtiesProps {
  topFuncoes: {
    funcao: string;
    appointments: number;
  }[];
}

type ChartType = "lista" | "pizza" | "radar" | "barras";

const getSpecialtyIcon = (funcao: string) => {
  const funcaoLower = funcao.toLowerCase();

  if (funcaoLower.includes("barbeiro")) return Scissors;
  if (funcaoLower.includes("pedicure")) return Footprints;
  if (funcaoLower.includes("manicure")) return Hand;
  if (funcaoLower.includes("massagista")) return Bubbles;
  if (funcaoLower.includes("designer de sobrancelha")) return EyeClosed;
  if (funcaoLower.includes("faxineiro")) return Trash;
  if (funcaoLower.includes("gerente")) return CircleUserRound;

  return Briefcase;
};

export default function TopSpecialties({ topFuncoes }: TopSpecialtiesProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>("lista");

  // Processar e limitar os dados para as top 6 funções (apenas para gráficos)
  const getTop6Funcoes = () => {
    return topFuncoes
      .sort((a, b) => {
        // Primeiro critério: maior número de appointments
        if (b.appointments !== a.appointments) {
          return b.appointments - a.appointments;
        }
        // Segundo critério: ordem alfabética em caso de empate
        return a.funcao.localeCompare(b.funcao);
      })
      .slice(0, 6);
  };

  // Todas as funções ordenadas (para lista padrão)
  const allFuncoesOrdenadas = topFuncoes.sort((a, b) => {
    // Primeiro critério: maior número de appointments
    if (b.appointments !== a.appointments) {
      return b.appointments - a.appointments;
    }
    // Segundo critério: ordem alfabética em caso de empate
    return a.funcao.localeCompare(b.funcao);
  });

  const top6Funcoes = getTop6Funcoes();

  // Converter dados para formato de gráfico
  const chartData = top6Funcoes.map((funcao, index) => ({
    funcao: funcao.funcao,
    appointments: funcao.appointments,
    fill: `var(--chart-${(index % 6) + 1})`, // Usar cores do tema
  }));

  const getChartTypeLabel = (type: ChartType) => {
    switch (type) {
      case "lista":
        return "Lista Padrão";
      case "pizza":
        return "Pizza";
      case "radar":
        return "Radar";
      case "barras":
        return "Barras Horizontal";
      default:
        return "Lista Padrão";
    }
  };
  if (!topFuncoes || topFuncoes.length === 0) {
    return (
      <Card className="mx-auto max-h-[500px] w-full overflow-y-auto">
        <CardContent>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Binoculars className="text-muted-foreground" />
              <CardTitle className="text-base">
                Funções mais Requisitadas
              </CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {getChartTypeLabel(selectedChart)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Tipo do Gráfico</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSelectedChart("lista")}>
                    Lista Padrão
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedChart("pizza")}>
                    Pizza
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedChart("radar")}>
                    Radar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedChart("barras")}>
                    Barras Horizontal
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma função com agendamentos ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxAppointments = Math.max(...topFuncoes.map((i) => i.appointments));

  // Renderizar o gráfico baseado na seleção
  const renderChart = () => {
    switch (selectedChart) {
      case "pizza":
        return <ChartPieLabel data={chartData} />;
      case "radar":
        return <ChartRadarDots data={chartData} />;
      case "barras":
        return <ChartBarHorizontal data={chartData} />;
      case "lista":
      default:
        return (
          <div className="space-y-6">
            {allFuncoesOrdenadas.map((funcaoData) => {
              const Icon = getSpecialtyIcon(funcaoData.funcao);
              // Porcentagem de ocupação da função baseando-se no maior número de agendamentos
              const progressValue =
                (funcaoData.appointments / maxAppointments) * 100;

              return (
                <div
                  key={funcaoData.funcao}
                  className="flex items-center gap-2"
                >
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex w-full flex-col justify-center">
                    <div className="flex w-full justify-between">
                      <h3 className="text-sm">{funcaoData.funcao}</h3>
                      <div className="text-right">
                        <span className="text-muted-foreground text-sm font-medium">
                          {funcaoData.appointments} agend.
                        </span>
                      </div>
                    </div>
                    <Progress value={progressValue} className="w-full" />
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };
  return (
    <Card className="mx-auto max-h-[500px] w-full overflow-y-auto">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Binoculars className="text-muted-foreground" />
            <CardTitle className="text-base">
              Funções mais Requisitadas
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {getChartTypeLabel(selectedChart)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Tipo do Gráfico</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSelectedChart("lista")}>
                  Lista Padrão
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedChart("pizza")}>
                  Pizza
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedChart("radar")}>
                  Radar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedChart("barras")}>
                  Barras Horizontal
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {renderChart()}
      </CardContent>
    </Card>
  );
}

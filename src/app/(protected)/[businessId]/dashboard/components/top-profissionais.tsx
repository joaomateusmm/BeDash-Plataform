"use client";

import React, { useState } from "react";
import { Briefcase, Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Importar os componentes de gráficos
import { ChartPieLabel } from "./charts-profissionais/pizza-chart";
import { ChartRadarDots } from "./charts-profissionais/radar-chart";
import { ChartBarHorizontal } from "./charts-profissionais/bar-horizontal-char";

interface TopprofissionaisProps {
  profissionais: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    appointments: number;
  }[];
}

type ChartType = "lista" | "pizza" | "radar" | "barras";

export default function Topprofissionais({
  profissionais,
}: TopprofissionaisProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>("lista");

  // Processar e limitar os dados para os top 6 profissionais (apenas para gráficos)
  const getTop6Profissionais = () => {
    return profissionais
      .sort((a, b) => {
        // Primeiro critério: maior número de appointments
        if (b.appointments !== a.appointments) {
          return b.appointments - a.appointments;
        }
        // Segundo critério: ordem alfabética em caso de empate
        return a.name.localeCompare(b.name);
      })
      .slice(0, 6);
  };

  // Todos os profissionais ordenados (para lista padrão)
  const allProfissionaisOrdenados = profissionais.sort((a, b) => {
    // Primeiro critério: maior número de appointments
    if (b.appointments !== a.appointments) {
      return b.appointments - a.appointments;
    }
    // Segundo critério: ordem alfabética em caso de empate
    return a.name.localeCompare(b.name);
  });

  const top6Profissionais = getTop6Profissionais();

  // Converter dados para formato de gráfico
  const chartData = top6Profissionais.map((prof, index) => ({
    name: prof.name,
    appointments: prof.appointments,
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

  if (!profissionais || profissionais.length === 0) {
    return (
      <Card className="mx-auto w-full">
        <CardContent>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase className="text-muted-foreground" />
              <CardTitle className="text-base">Profissionais</CardTitle>
            </div>
          </div>
          <div className="py-8 text-center">
            <p className="text-muted-foreground mx-auto mt-auto">
              Nenhum profissional com agendamentos ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderizar componente baseado no tipo selecionado
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
            {allProfissionaisOrdenados.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-100 text-lg font-medium text-gray-600">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm">{doctor.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      Profissional
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-sm font-medium">
                    {doctor.appointments} serviços agendados.
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <Card className="mx-auto max-h-[500px] w-full overflow-y-auto">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="text-muted-foreground" />
            <CardTitle className="text-base">Ranking Funcionários</CardTitle>
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

        {/* Renderizar o tipo de visualização selecionado */}
        {renderChart()}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { TrendingUp, Users, Mail, Phone } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Importar os componentes de gráfico
import { ChartPieLabel } from "./charts-clientes/pizza-chart";
import { ChartRadarDots } from "./charts-clientes/radar-chart";
import { ChartBarHorizontal } from "./charts-clientes/bar-horizontal-char";

interface ClientesEngajadosProps {
  topClientes: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    appointments: number;
  }[];
}

type ChartType = "lista" | "pizza" | "radar" | "barras";

export const description = "A bar chart with a custom label";

export function ClientsInteractingChart({
  topClientes,
}: ClientesEngajadosProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>("lista");

  // Processar e limitar os dados para os top 6 clientes (apenas para gráficos)
  const getTop6Clientes = () => {
    return topClientes
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

  // Top 10 clientes para lista padrão (com informações de contato)
  const getTop10ClientesLista = () => {
    return topClientes
      .sort((a, b) => {
        // Primeiro critério: maior número de appointments
        if (b.appointments !== a.appointments) {
          return b.appointments - a.appointments;
        }
        // Segundo critério: ordem alfabética em caso de empate
        return a.name.localeCompare(b.name);
      })
      .slice(0, 10);
  };

  const top6Clientes = getTop6Clientes();
  const top10ClientesLista = getTop10ClientesLista();

  // Converter dados para formato de gráfico
  const chartData = top6Clientes.map((cliente, index) => ({
    name: cliente.name,
    appointments: cliente.appointments,
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

  if (!topClientes || topClientes.length === 0) {
    return (
      <Card className="mx-auto max-h-[550px] w-full overflow-y-auto">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Clientes mais Engajados</CardTitle>
            <CardDescription>
              Crie campanhas de vendas para os clientes mais engajados.
            </CardDescription>
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
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              Nenhum cliente com agendamentos ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          <div className="space-y-4">
            {top10ClientesLista.map((cliente, index) => (
              <div
                key={cliente.id}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-100 text-lg font-medium text-gray-600">
                      {cliente.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{cliente.name}</h3>
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>
                          {cliente.email && cliente.email.trim() !== ""
                            ? cliente.email
                            : "(não possui)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>
                          {cliente.phoneNumber &&
                          cliente.phoneNumber.trim() !== ""
                            ? cliente.phoneNumber
                            : "(não possui)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                    {cliente.appointments} agendamentos
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };
  return (
    <Card className="mx-auto max-h-[550px] w-full overflow-y-auto">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Clientes mais Engajados</CardTitle>
          <CardDescription>
            Crie campanhas de vendas para os clientes mais engajados.
          </CardDescription>
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
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}

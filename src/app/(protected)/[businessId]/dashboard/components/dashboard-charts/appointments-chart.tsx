"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import * as React from "react";

dayjs.locale("pt-br");
import { DollarSign } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Bar,
  BarChart,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrencyInCents } from "@/helpers/currency";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DailyAppointment {
  date: string;
  appointments: number;
  revenue: number | null;
}

interface AppointmentsChartProps {
  appointmentsPerDay: { date: string; appointments: number; revenue: number }[];
}

const AppointmentsChart = ({
  appointmentsPerDay = [],
}: AppointmentsChartProps) => {
  // Estados para controlar o tipo de gráfico e período de tempo
  const [chartType, setChartType] = React.useState<"area" | "line" | "bar">(
    "area",
  );
  const [timeRange, setTimeRange] = React.useState("90d");
  const [activeChart, setActiveChart] = React.useState<
    "appointments" | "revenue"
  >("appointments");

  // Função para filtrar dados por período
  const getFilteredData = () => {
    let days = 90;
    let isFuture = false;

    // Períodos passados
    if (timeRange === "30d") {
      days = 30;
    } else if (timeRange === "7d") {
      days = 7;
    }
    // Períodos futuros
    else if (timeRange === "7d-future") {
      days = 7;
      isFuture = true;
    } else if (timeRange === "30d-future") {
      days = 30;
      isFuture = true;
    } else if (timeRange === "90d-future") {
      days = 90;
      isFuture = true;
    }

    const chartDays = Array.from({ length: days }).map((_, i) => {
      if (isFuture) {
        // Para períodos futuros: do dia atual até X dias à frente
        return dayjs().add(i, "days").format("YYYY-MM-DD");
      } else {
        // Para períodos passados: X dias atrás até hoje
        return dayjs()
          .subtract(days - 1 - i, "days")
          .format("YYYY-MM-DD");
      }
    });

    return chartDays.map((date) => {
      const dataForDay = appointmentsPerDay?.find(
        (item: { date: string; appointments: number; revenue: number }) =>
          item.date === date,
      );

      return {
        date: dayjs(date).format("DD/MM"),
        fullDate: date,
        appointments: dataForDay?.appointments || 0,
        revenue: Number(dataForDay?.revenue || 0),
      };
    });
  };

  const chartData = getFilteredData();

  const chartConfig = {
    appointments: {
      label: "Agendamentos",
      color: "#7F22FE",
    },
    revenue: {
      label: "Faturamento",
      color: "#10B981",
    },
  } satisfies ChartConfig;

  // Totais para Line e Bar charts
  const total = React.useMemo(
    () => ({
      appointments: chartData.reduce((acc, curr) => acc + curr.appointments, 0),
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
    }),
    [chartData],
  );

  // Função para renderizar o gráfico baseado no tipo selecionado
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  formatter={(value, name) => {
                    if (name === "appointments") {
                      return (
                        <span className="text-sm font-medium text-gray-800">
                          Agend. {value}
                        </span>
                      );
                    } else if (name === "revenue") {
                      return (
                        <span className="text-sm font-medium text-gray-800">
                          Fatur. {formatCurrencyInCents(Number(value))}
                        </span>
                      );
                    }
                    return value;
                  }}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return (
                        <span className="text-muted-foreground text-xs">
                          {dayjs(payload[0].payload?.fullDate).format(
                            "DD/MM/YYYY (dddd)",
                          )}
                        </span>
                      );
                    }
                    return value;
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={chartConfig[activeChart].color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  formatter={(value, name) => {
                    if (name === "appointments") {
                      return (
                        <span className="text-sm font-medium text-gray-800">
                          Agend. {value}
                        </span>
                      );
                    } else if (name === "revenue") {
                      return (
                        <span className="text-sm font-medium text-gray-800">
                          Fatur. {formatCurrencyInCents(Number(value))}
                        </span>
                      );
                    }
                    return value;
                  }}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return (
                        <span className="text-muted-foreground text-xs">
                          {dayjs(payload[0].payload?.fullDate).format(
                            "DD/MM/YYYY (dddd)",
                          )}
                        </span>
                      );
                    }
                    return value;
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={chartConfig[activeChart].color} />
          </BarChart>
        );

      default: // area
        return (
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === "revenue") {
                      return (
                        <span className="text-sm font-medium text-gray-800">
                          Fatur. {formatCurrencyInCents(Number(value))}
                        </span>
                      );
                    } else if (name === "appointments") {
                      return (
                        <span className="text-sm font-medium text-gray-800">
                          Agend. {value}
                        </span>
                      );
                    }
                    return [value, name];
                  }}
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return (
                        <span className="text-muted-foreground text-xs">
                          {dayjs(payload[0].payload?.fullDate).format(
                            "DD/MM/YYYY (dddd)",
                          )}
                        </span>
                      );
                    }
                    return value;
                  }}
                  indicator="dot"
                />
              }
            />
            <defs>
              <linearGradient id="fillAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7F22FE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#7F22FE" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="appointments"
              type="natural"
              fill="url(#fillAppointments)"
              fillOpacity={0.4}
              stroke="#7F22FE"
              stackId="a"
            />
            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              fillOpacity={0.4}
              stroke="#10B981"
              stackId="a"
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card>
      {/* Header com seletores diferentes baseados no tipo de gráfico */}
      {chartType === "line" || chartType === "bar" ? (
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
            <div className="mb-2 flex items-center gap-2">
              <DollarSign />
              <CardTitle>Agendamentos e Faturamento</CardTitle>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 3 meses</SelectItem>
                  <SelectItem value="7d-future">Próximos 7 dias</SelectItem>
                  <SelectItem value="30d-future">Próximos 30 dias</SelectItem>
                  <SelectItem value="90d-future">Próximos 3 meses</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Tipo</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuLabel>Tipo de Gráficos</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setChartType("bar")}>
                      Barras Verticais
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType("line")}>
                      Em Linhas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType("area")}>
                      Áreas
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex">
            {(["appointments", "revenue"] as const).map((key) => {
              return (
                <button
                  key={key}
                  data-active={activeChart === key}
                  className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                  onClick={() => setActiveChart(key)}
                >
                  <span className="text-muted-foreground text-xs">
                    {chartConfig[key].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-3xl">
                    {key === "revenue"
                      ? formatCurrencyInCents(total[key])
                      : total[key].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
      ) : (
        <CardHeader className="flex flex-row items-center gap-2">
          <DollarSign />
          <div className="flex w-full flex-row items-center justify-between gap-2">
            <CardTitle>Agendamentos e Faturamento</CardTitle>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 3 meses</SelectItem>
                  <SelectItem value="7d-future">Próximos 7 dias</SelectItem>
                  <SelectItem value="30d-future">Próximos 30 dias</SelectItem>
                  <SelectItem value="90d-future">Próximos 3 meses</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Tipo</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuLabel>Tipo de Gráficos</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setChartType("bar")}>
                      Barras Verticais
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType("line")}>
                      Em Linhas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setChartType("area")}>
                      Áreas
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent
        className={
          chartType === "line" || chartType === "bar" ? "px-2 sm:p-6" : ""
        }
      >
        <ChartContainer config={chartConfig} className="h-[550px] w-full">
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentsChart;

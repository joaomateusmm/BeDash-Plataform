"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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

export const description = "A radar chart with dots";

interface ChartData {
  funcao: string;
  appointments: number;
  fill: string;
}

interface ChartRadarDotsProps {
  data: ChartData[];
}

const chartConfig = {
  appointments: {
    label: "Agendamentos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const funcao = data.funcao;
    const appointments = data.appointments;

    return (
      <div className="bg-background rounded-lg border p-3 shadow-md">
        <p className="text-sm font-semibold">
          {appointments} Agend. ({funcao})
        </p>
      </div>
    );
  }
  return null;
};

export function ChartRadarDots({ data }: ChartRadarDotsProps) {
  const totalAppointments = data.reduce(
    (sum, item) => sum + item.appointments,
    0,
  );

  return (
    <Card className="max-h-[500px]">
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto max-h-[250px]">
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <PolarAngleAxis
              dataKey="funcao"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                value.length > 12 ? value.substring(0, 12) + "..." : value
              }
            />
            <PolarGrid />
            <Radar
              dataKey="appointments"
              fill="var(--color-appointments)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total: {totalAppointments} agendamentos
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Mostrando as top 6 funções
        </div>
      </CardFooter>
    </Card>
  );
}

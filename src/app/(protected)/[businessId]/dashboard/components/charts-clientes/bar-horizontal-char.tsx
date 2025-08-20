"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

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

export const description = "A horizontal bar chart";

interface ChartData {
  name: string;
  appointments: number;
  fill: string;
}

interface ChartBarHorizontalProps {
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
    const firstName = data.name.split(" ")[0]; // Pegar apenas o primeiro nome
    const appointments = data.appointments;

    return (
      <div className="bg-background rounded-lg border p-3 shadow-md">
        <p className="text-sm font-semibold">
          {appointments} Agend. ({firstName})
        </p>
      </div>
    );
  }
  return null;
};

export function ChartBarHorizontal({ data }: ChartBarHorizontalProps) {
  const totalAppointments = data.reduce(
    (sum, item) => sum + item.appointments,
    0,
  );

  return (
    <Card className="max-h-[500px]">
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[300px]">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: -20,
            }}
          >
            <XAxis type="number" dataKey="appointments" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.split(" ")[0]} // Mostrar só o primeiro nome
              width={80}
            />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Bar
              dataKey="appointments"
              fill="var(--color-appointments)"
              radius={5}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 pt-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Total: {totalAppointments} agendamentos
        </div>
        <div className="text-muted-foreground leading-none">
          Mostrando os top 6 clientes
        </div>
      </CardFooter>
    </Card>
  );
}

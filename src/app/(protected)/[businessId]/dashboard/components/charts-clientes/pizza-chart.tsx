"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart with a label";

interface ChartData {
  name: string;
  appointments: number;
  fill: string;
}

interface ChartPieLabelProps {
  data: ChartData[];
}

const chartConfig = {
  appointments: {
    label: "Agendamentos",
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

export function ChartPieLabel({ data }: ChartPieLabelProps) {
  const totalAppointments = data.reduce(
    (sum, item) => sum + item.appointments,
    0,
  );

  function firstName(name: string) {
    return typeof name === "string" ? name.split(" ")[0] : "";
  }

  return (
    <Card className="flex max-h-[500px] flex-col">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              className="text-gray-200"
              data={data}
              dataKey="appointments"
              label={({ appointments, name }) =>
                `${appointments} Agend. ${firstName(name)}`
              }
              nameKey="name"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 pt-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total: {totalAppointments} agendamentos
        </div>
        <div className="text-muted-foreground leading-none">
          Mostrando os top 6 clientes
        </div>
      </CardFooter>
    </Card>
  );
}

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

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopSpecialtiesProps {
  topFuncoes: {
    funcao: string;
    appointments: number;
  }[];
}

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
  if (!topFuncoes || topFuncoes.length === 0) {
    return (
      <Card className="mx-auto w-full">
        <CardContent>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Binoculars className="text-muted-foreground" />
              <CardTitle className="text-base">
                Funções mais Requisitadas
              </CardTitle>
            </div>
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
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Binoculars className="text-muted-foreground" />
            <CardTitle className="text-base">
              Funções mais Requisitadas
            </CardTitle>
          </div>
        </div>

        {/* funcoes List */}
        <div className="space-y-6">
          {topFuncoes.map((funcaoData) => {
            const Icon = getSpecialtyIcon(funcaoData.funcao);
            // Porcentagem de ocupação da função baseando-se no maior número de agendamentos
            const progressValue =
              (funcaoData.appointments / maxAppointments) * 100;

            return (
              <div key={funcaoData.funcao} className="flex items-center gap-2">
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
      </CardContent>
    </Card>
  );
}

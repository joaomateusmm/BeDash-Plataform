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
  topSpecialties: {
    specialty: string;
    appointments: number;
  }[];
}

const getSpecialtyIcon = (specialty: string) => {
  const specialtyLower = specialty.toLowerCase();

  if (specialtyLower.includes("barbeiro")) return Scissors;
  if (
    specialtyLower.includes("pedicure")
  )
    return Footprints;
  if (specialtyLower.includes("manicure")) return Hand;
  if (specialtyLower.includes("massagista")) return Bubbles;
  if (
    specialtyLower.includes("designer de sobrancelha")
  )
    return EyeClosed;
  if (specialtyLower.includes("faxineiro")) return Trash;
  if (specialtyLower.includes("gerente")) return CircleUserRound;

  return Briefcase;
};

export default function TopSpecialties({
  topSpecialties,
}: TopSpecialtiesProps) {
  const maxAppointments = Math.max(
    ...topSpecialties.map((i) => i.appointments),
  );
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Binoculars className="text-muted-foreground" />
            <CardTitle className="text-base">Especialidades mais Requisitadas</CardTitle>
          </div>
        </div>

        {/* specialtys List */}
        <div className="space-y-6">
          {topSpecialties.map((specialty) => {
            const Icon = getSpecialtyIcon(specialty.specialty);
            // Porcentagem de ocupação da especialidade baseando-se no maior número de agendamentos
            const progressValue =
              (specialty.appointments / maxAppointments) * 100;

            return (
              <div
                key={specialty.specialty}
                className="flex items-center gap-2"
              >
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div className="flex w-full flex-col justify-center">
                  <div className="flex w-full justify-between">
                    <h3 className="text-sm">{specialty.specialty}</h3>
                    <div className="text-right">
                      <span className="text-muted-foreground text-sm font-medium">
                        {specialty.appointments} agend.
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
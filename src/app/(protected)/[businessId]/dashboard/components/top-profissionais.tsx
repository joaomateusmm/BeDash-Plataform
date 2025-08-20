import { Briefcase, Stethoscope } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface TopprofissionaisProps {
  profissionais: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    appointments: number;
  }[];
}

export default function Topprofissionais({ profissionais }: TopprofissionaisProps) {
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
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhum profissional com agendamentos ainda.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="text-muted-foreground" />
            <CardTitle className="text-base">Profissionais</CardTitle>
          </div>
        </div>

        {/* profissionais List */}
        <div className="space-y-6">
          {profissionais.map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between">
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
      </CardContent>
    </Card>
  );
}
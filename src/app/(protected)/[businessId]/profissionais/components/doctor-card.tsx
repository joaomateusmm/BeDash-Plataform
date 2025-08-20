"use client";

import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDoctor } from "@/actions/delete-doctor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { profissionaisTable } from "@/db/schema";
import { formatCurrencyInCents } from "@/helpers/currency";

import { getAvailability } from "../helpers/availability";
import UpsertDoctorForm from "./upsert-doctor-form";
import { useVisibility } from "./visibility-context";

interface Funcao {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: string;
}

type ProfissionalWithFuncoes = typeof profissionaisTable.$inferSelect & {
  profissionaisToFuncoes?: Array<{
    funcao: Funcao;
  }>;
};

interface DoctorCardProps {
  doctor: ProfissionalWithFuncoes;
  funcoes: Funcao[];
}

const DoctorCard = ({ doctor, funcoes }: DoctorCardProps) => {
  const { isValueVisible } = useVisibility();
  const [isUpsertDoctorDialogOpen, setIsUpsertDoctorDialogOpen] =
    useState(false);
  const deleteDoctorAction = useAction(deleteDoctor, {
    onSuccess: () => {
      toast.success("Funcionário deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar funcionário.");
    },
  });
  const handleDeleteDoctorClick = () => {
    if (!doctor) return;
    deleteDoctorAction.execute({ id: doctor.id });
  };

  const doctorInitials = doctor.name
    .split(" ")
    .map((name) => name[0])
    .join("");
  const availability = getAvailability(doctor);

  const doctorFuncoes = doctor.profissionaisToFuncoes?.map(pf => pf.funcao) || [];

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-13 w-13 flex-shrink-0">
            <AvatarFallback>{doctorInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium">{doctor.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {doctorFuncoes.length > 0 ? (
                doctorFuncoes.slice(0, 2).map((funcao) => (
                  <Badge key={funcao.id} variant="secondary" className="text-xs">
                    {funcao.name}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">Sem funções</span>
              )}
              {doctorFuncoes.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{doctorFuncoes.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-1 flex-col gap-2">
        <Badge variant="outline" className="w-full justify-start">
          <CalendarIcon className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {availability.from.format("dddd")} a{" "}
            {availability.to.format("dddd")}
          </span>
        </Badge>
        <Badge variant="outline" className="w-full justify-start">
          <ClockIcon className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {availability.from.format("HH:mm")} as{" "}
            {availability.to.format("HH:mm")}
          </span>
        </Badge>
        <Badge variant="outline" className="w-full justify-start">
          <DollarSignIcon className="mr-1 flex-shrink-0" />
          <span className="truncate">
            {isValueVisible
              ? formatCurrencyInCents(doctor.appointmentPriceInCents)
              : "R$ ****,**"}
          </span>
        </Badge>
      </CardContent>
      <Separator />
      <CardFooter className="mt-auto flex flex-col gap-2">
        <Dialog
          open={isUpsertDoctorDialogOpen}
          onOpenChange={setIsUpsertDoctorDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="w-full">Ver detalhes</Button>
          </DialogTrigger>
          <UpsertDoctorForm
            doctor={{
              ...doctor,
              availableFromTime: availability.from.format("HH:mm:ss"),
              availableToTime: availability.to.format("HH:mm:ss"),
            }}
            funcoes={funcoes}
            onSuccess={() => setIsUpsertDoctorDialogOpen(false)}
            isOpen={isUpsertDoctorDialogOpen}
          />
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full duration-400 hover:bg-red-400"
            >
              <TrashIcon />
              Deletar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja deletar esse funcionário?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser revertida. Isso irá deletar o funcionário e
                todas as consultas agendadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDoctorClick}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default DoctorCard;

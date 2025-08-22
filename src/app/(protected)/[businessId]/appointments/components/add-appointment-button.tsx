"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { profissionaisTable, clientesTable } from "@/db/schema";
import { useTrialMonitor } from "@/hooks/use-trial-monitor";
import { toast } from "sonner";

import AddAppointmentForm from "./add-appointment-form";

interface AddAppointmentButtonProps {
  clientes: (typeof clientesTable.$inferSelect)[];
  profissionais: (typeof profissionaisTable.$inferSelect)[];
}

const AddAppointmentButton = ({
  clientes,
  profissionais,
}: AddAppointmentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const monitor = useTrialMonitor();

  const handleOpenDialog = () => {
    if (monitor.isAtLimit("currentAppointmentsThisMonth")) {
      toast.error("Limite de agendamentos atingido", {
        description:
          "Você atingiu o limite de agendamentos mensais do seu plano atual. Faça upgrade para adicionar mais agendamentos.",
      });
      return;
    }
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleOpenDialog}
          disabled={monitor.isAtLimit("currentAppointmentsThisMonth")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo agendamento
        </Button>
      </DialogTrigger>
      <AddAppointmentForm
        isOpen={isOpen}
        clientes={clientes}
        profissionais={profissionais}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddAppointmentButton;

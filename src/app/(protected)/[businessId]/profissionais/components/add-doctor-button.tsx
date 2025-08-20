"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useTrialMonitor } from "@/hooks/use-trial-monitor";
import { toast } from "sonner";

import UpsertDoctorForm from "./upsert-doctor-form";

interface Funcao {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: string;
}

interface AddDoctorButtonProps {
  funcoes: Funcao[];
}

const AddDoctorButton = ({ funcoes }: AddDoctorButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const monitor = useTrialMonitor();

  const handleOpenDialog = () => {
    if (monitor.isAtLimit("currentDoctors")) {
      toast.error("Limite de profissionais atingido", {
        description:
          "Você atingiu o limite de 10 profissionais do plano básico. Faça upgrade para adicionar mais profissionais.",
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
          disabled={monitor.isAtLimit("currentDoctors")}
        >
          <Plus />
          Adicionar Funcionário
        </Button>
      </DialogTrigger>
      <UpsertDoctorForm
        onSuccess={() => setIsOpen(false)}
        isOpen={isOpen}
        funcoes={funcoes}
      />
    </Dialog>
  );
};

export default AddDoctorButton;

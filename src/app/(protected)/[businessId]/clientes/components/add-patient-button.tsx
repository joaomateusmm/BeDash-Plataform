"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useTrialMonitor } from "@/hooks/use-trial-monitor";
import { toast } from "sonner";

import UpsertPatientForm from "./upsert-patient-form";

const AddPatientButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const monitor = useTrialMonitor();

  const handleOpenDialog = () => {
    if (monitor.isAtLimit("currentClients")) {
      toast.error("Limite de clientes atingido", {
        description:
          "Você atingiu o limite de clientes do seu plano atual. Faça upgrade para adicionar mais clientes.",
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
          disabled={monitor.isAtLimit("currentClients")}
        >
          <Plus />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      <UpsertPatientForm onSuccess={() => setIsOpen(false)} isOpen={isOpen} />
    </Dialog>
  );
};

export default AddPatientButton;

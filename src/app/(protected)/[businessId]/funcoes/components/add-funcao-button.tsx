"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { UpsertFuncaoForm } from "./upsert-funcao-form";
import { useTrialMonitor } from "@/hooks/use-trial-monitor";
import { toast } from "sonner";

export function AddFuncaoButton() {
  const [open, setOpen] = useState(false);
  const monitor = useTrialMonitor();

  const handleOpenDialog = () => {
    if (monitor.isAtLimit("currentFunctions")) {
      toast.error("Limite de funções atingido", {
        description:
          "Você atingiu o limite de 10 funções do plano básico. Faça upgrade para adicionar mais funções.",
      });
      return;
    }
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          onClick={handleOpenDialog}
          disabled={monitor.isAtLimit("currentFunctions")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Função
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Função</DialogTitle>
          <DialogDescription>
            Adicione uma nova função para seus funcionários
          </DialogDescription>
        </DialogHeader>
        <UpsertFuncaoForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

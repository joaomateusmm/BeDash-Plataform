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

export function AddFuncaoButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
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

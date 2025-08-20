"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { profissionaisTable, clientesTable } from "@/db/schema";
import UpsertBusinessForm from "./upsert-business-form";

interface AddBusinessButtonProps {
  clientes: (typeof clientesTable.$inferSelect)[];
  profissionais: (typeof profissionaisTable.$inferSelect)[];
}

const AddBusinessButton: React.FC<AddBusinessButtonProps> = ({
  clientes,
  profissionais,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </DialogTrigger>
      <UpsertBusinessForm isOpen={isOpen} onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddBusinessButton;

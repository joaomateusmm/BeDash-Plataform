"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

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
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
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
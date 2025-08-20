"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createBusiness } from "@/actions/create-business";
import { updateBusiness } from "@/actions/update-business";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clinicsTable } from "@/db/schema";

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Nome da empresa é obrigatório.",
    })
    .max(100, {
      message: "Nome da empresa deve ter no máximo 100 caracteres.",
    }),
});

interface UpsertBusinessFormProps {
  isOpen: boolean;
  business?: typeof clinicsTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertBusinessForm = ({
  business,
  onSuccess,
  isOpen,
}: UpsertBusinessFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: business?.name ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: business?.name ?? "",
      });
    }
  }, [isOpen, form, business]);

  const createBusinessAction = useAction(createBusiness, {
    onSuccess: () => {
      toast.success("Empresa criada com sucesso.");
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar empresa.");
    },
  });

  const updateBusinessAction = useAction(updateBusiness, {
    onSuccess: () => {
      toast.success("Empresa atualizada com sucesso.");
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar empresa.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (business?.id) {
      updateBusinessAction.execute({
        ...values,
        id: business.id,
      });
    } else {
      createBusinessAction.execute(values);
    }
  };

  const isLoading =
    createBusinessAction.isExecuting || updateBusinessAction.isExecuting;

  return (
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>
          {business ? "Editar empresa" : "Nova empresa"}
        </DialogTitle>
        <DialogDescription>
          {business
            ? "Edite as informações da sua empresa."
            : "Crie uma nova empresa para gerenciar."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome da empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <DialogFooter>
        <Button
          form="form"
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {business ? "Atualizar" : "Criar"} empresa
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UpsertBusinessForm;

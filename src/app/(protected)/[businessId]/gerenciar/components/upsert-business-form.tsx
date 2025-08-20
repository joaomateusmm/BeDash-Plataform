"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
  name: z.string().trim().min(1, {
    message: "Nome da empresa é obrigatório.",
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
      form.reset({ name: business?.name ?? "" });
    }
  }, [isOpen, form, business]);

  // Server action para atualizar empresa
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
    if (!business?.id) return;

    updateBusinessAction.execute({
      id: business.id,
      ...values,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Empresa</DialogTitle>
        <DialogDescription>
          Atualize as informações da sua empresa.
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
          <DialogFooter>
            <Button
              type="submit"
              disabled={updateBusinessAction.isExecuting}
              className="w-full"
            >
              {updateBusinessAction.isExecuting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertBusinessForm;

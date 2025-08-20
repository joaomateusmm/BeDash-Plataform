"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  upsertFuncaoSchema,
  type UpsertFuncaoSchema,
} from "@/actions/upsert-funcao/schema";
import { upsertFuncaoAction } from "@/actions/upsert-funcao";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface UpsertFuncaoFormProps {
  onSuccess?: () => void;
  defaultValues?: UpsertFuncaoSchema;
}

export function UpsertFuncaoForm({
  onSuccess,
  defaultValues,
}: UpsertFuncaoFormProps) {
  const form = useForm<UpsertFuncaoSchema>({
    resolver: zodResolver(upsertFuncaoSchema),
    defaultValues: {
      name: "",
      description: "",
      ...defaultValues,
    },
  });

  const { execute: executeUpsertFuncao, isExecuting } = useAction(
    upsertFuncaoAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message || "Função salva com sucesso!");
        form.reset({
          name: "",
          description: "",
        });
        onSuccess?.();
      },
      onError: ({ error }) => {
        // A mensagem de erro personalizada vem no serverError
        const errorMessage =
          error.serverError || "Erro inesperado ao salvar função";
        toast.error(errorMessage);
      },
    },
  );

  const onSubmit = (values: UpsertFuncaoSchema) => {
    executeUpsertFuncao(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Função</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Ex: Barbeiro, Recepcionista..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  placeholder="Breve descrição da função..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isExecuting}>
            {defaultValues?.id ? "Atualizar" : "Criar"} Função
          </Button>
        </div>
      </form>
    </Form>
  );
}

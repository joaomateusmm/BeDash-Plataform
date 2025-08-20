"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteFuncaoAction } from "@/actions/delete-funcao";
import { UpsertFuncaoForm } from "./upsert-funcao-form";
import { PageContent } from "@/components/ui/page-container";

interface Funcao {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  profissionaisToFuncoes: Array<{
    profissional: {
      id: string;
      name: string;
    };
  }>;
}

interface FuncoesTableProps {
  funcoes: Funcao[];
}

export function FuncoesTable({ funcoes }: FuncoesTableProps) {
  const [editingFuncao, setEditingFuncao] = useState<Funcao | null>(null);

  const { execute: deleteFuncao, isExecuting: isDeletingFuncao } = useAction(
    deleteFuncaoAction,
    {
      onSuccess: ({ data }) => {
        toast.success(data?.message);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "Erro inesperado");
      },
    },
  );

  const handleDelete = (id: string) => {
    deleteFuncao({ id });
  };

  if (funcoes.length === 0) {
    return (
      <PageContent>
        {funcoes.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="mx-auto max-w-[450px]">
              <Image
                src="/illustrationNaoEncontrado.svg"
                alt="Ilustração pessoa segurando um celular"
                width={320}
                height={320}
                className="mx-auto mb-4 opacity-80"
              />
              <h3 className="mb-2 text-lg font-semibold text-gray-900 opacity-80">
                Nenhuma função encontrada
              </h3>
              <p className="mb-6 text-gray-600 opacity-80">
                Você ainda não possui funções adicionadas, crie funções para dar
                aos seus funcionários mais controle e flexibilidade.
              </p>
            </div>
          </div>
        ) : (
          <div className="hidden"></div>
        )}
      </PageContent>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Funcionários</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {funcoes.map((funcao) => (
              <TableRow key={funcao.id}>
                <TableCell className="font-medium">{funcao.name}</TableCell>
                <TableCell>
                  {funcao.description || (
                    <span className="text-muted-foreground">Sem descrição</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {funcao.profissionaisToFuncoes.length} funcionário
                    {funcao.profissionaisToFuncoes.length !== 1 ? "s" : ""}
                  </Badge>
                </TableCell>
                <TableCell>
                  {dayjs(funcao.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingFuncao(funcao)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá
                              permanentemente a função "{funcao.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(funcao.id)}
                              disabled={isDeletingFuncao}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editingFuncao}
        onOpenChange={() => setEditingFuncao(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Função</DialogTitle>
            <DialogDescription>
              Faça alterações na função selecionada
            </DialogDescription>
          </DialogHeader>
          {editingFuncao && (
            <UpsertFuncaoForm
              defaultValues={{
                id: editingFuncao.id,
                name: editingFuncao.name,
                description: editingFuncao.description || undefined,
              }}
              onSuccess={() => setEditingFuncao(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import {
  Building2,
  Users,
  Calendar,
  Briefcase,
  CreditCard,
  TrendingUp,
  Edit,
  Trash2,
  MoreVertical,
  Gem,
} from "lucide-react";
import { toast } from "sonner";

import { deleteBusiness } from "@/actions/delete-business";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import { clinicsTable } from "@/db/schema";
import { formatCurrency } from "@/helpers/currency";
import UpsertBusinessForm from "./upsert-business-form";

interface BusinessCardProps {
  business: typeof clinicsTable.$inferSelect & {
    _count: {
      clientes: number;
      profissionais: number;
      agendamentos: number;
    };
    stats: {
      totalRevenue: number;
      monthlyRevenue: number;
      subscription: string;
    };
  };
}

const BusinessCard = ({ business }: BusinessCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const deleteBusinessAction = useAction(deleteBusiness, {
    onSuccess: () => {
      toast.success("Empresa excluída com sucesso.");
      setShowDeleteDialog(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao excluir empresa.");
    },
  });

  const handleDelete = () => {
    deleteBusinessAction.execute({ id: business.id });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Building2 className="h-5 w-5" />
            {business.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estatísticas principais */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">Clientes</span>
              </div>
              <p className="text-2xl font-bold">{business._count.clientes}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  Agendamentos
                </span>
              </div>
              <p className="text-2xl font-bold">
                {business._count.agendamentos}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  Funcionários
                </span>
              </div>
              <p className="text-2xl font-bold">
                {business._count.profissionais}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gem className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm">
                  Assinatura
                </span>
              </div>
              <Badge
                variant={
                  business.stats.subscription.toLowerCase() === "Básico"
                    ? "default"
                    : "secondary"
                }
              >
                {business.stats.subscription}
              </Badge>
            </div>
          </div>

          {/* Faturamento */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-4 w-4" />
              Faturamento
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(business.stats.totalRevenue)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Este mês</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(business.stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="text-muted-foreground border-t pt-2 text-sm">
            <div className="flex justify-between">
              <span>Criada em:</span>
              <span>{formatDate(business.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação para deletar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{business.name}"? Esta
              ação não pode ser desfeita e todos os dados associados serão
              perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteBusinessAction.isExecuting}
            >
              {deleteBusinessAction.isExecuting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <UpsertBusinessForm
          business={business}
          isOpen={showEditDialog}
          onSuccess={() => setShowEditDialog(false)}
        />
      </Dialog>
    </>
  );
};

export default BusinessCard;

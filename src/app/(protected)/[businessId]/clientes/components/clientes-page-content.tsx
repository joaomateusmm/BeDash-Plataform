"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2, Check, CheckSquare } from "lucide-react";
import { useAction } from "next-safe-action/hooks";

import { PageContent } from "@/components/ui/page-container";
import { clientesTable } from "@/db/schema";
import { deleteMultiplePatients } from "@/actions/delete-multiple-patients";

import AddPatientButton from "./add-patient-button";
import { clientesTableColumns } from "./table-columns";

interface ClientesPageContentProps {
  clientes: (typeof clientesTable.$inferSelect)[];
}

const ClientesPageContent = ({ clientes }: ClientesPageContentProps) => {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [table, setTable] = useState<any>(null);

  const deleteMultiplePatientsAction = useAction(deleteMultiplePatients, {
    onSuccess: ({ data }) => {
      console.log(data?.message || "Clientes deletados com sucesso");
      setSelectedRows({});
    },
    onError: ({ error }) => {
      console.error(error.serverError || "Erro ao deletar clientes");
    },
  });

  const selectedCount = Object.values(selectedRows).filter(Boolean).length;
  const allClienteIds = clientes.map((cliente) => cliente.id);

  const handleSelectAll = () => {
    // Selecionar todos os clientes da empresa
    const newSelection: Record<string, boolean> = {};
    allClienteIds.forEach((id) => {
      newSelection[id] = true;
    });
    setSelectedRows(newSelection);
  };

  const handleSelectPage = () => {
    if (table) {
      table.toggleAllPageRowsSelected(true);
    }
  };

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(selectedRows).filter(
      (id) => selectedRows[id],
    );
    if (selectedIds.length > 0) {
      deleteMultiplePatientsAction.execute({ ids: selectedIds });
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={deleteMultiplePatientsAction.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir ({selectedCount})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={clientes.length === 0}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Marcar Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectPage}
            disabled={clientes.length === 0}
          >
            <Check className="mr-2 h-4 w-4" />
            Marcar Página
          </Button>
        </div>
        <AddPatientButton />
      </div>

      <PageContent>
        <DataTable
          data={clientes}
          columns={clientesTableColumns}
          onRowSelectionChange={setSelectedRows}
          rowSelection={selectedRows}
          onTableInstanceChange={setTable}
        />
      </PageContent>

      <PageContent>
        {clientes.length === 0 ? (
          <div className="mt-4 flex flex-col items-center justify-center text-center">
            <div className="mx-auto max-w-[450px]">
              <Image
                src="/illustrationNaoEncontrado.svg"
                alt="Ilustração pessoa segurando um celular"
                width={320}
                height={320}
                className="mx-auto mb-4 opacity-80"
              />
              <h3 className="text-foreground mb-2 text-lg font-semibold opacity-80">
                Nenhum cliente adicionado
              </h3>
              <p className="text-muted-foreground mb-6 opacity-80">
                Você ainda não possui clientes adicionados, crie um para fazer{" "}
                <a className="text-primary font-medium">campanhas</a> de
                marketing, mandando mensagens, promoções e muito mais usando
                nossa I.A com um clique!
              </p>
            </div>
          </div>
        ) : (
          <div className="hidden"></div>
        )}
      </PageContent>
    </>
  );
};

export default ClientesPageContent;

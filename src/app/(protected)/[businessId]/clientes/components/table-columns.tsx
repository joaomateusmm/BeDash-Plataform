"use client";

import { ColumnDef } from "@tanstack/react-table";

import { clientesTable } from "@/db/schema";

import ClientesTableActions from "./table-actions";

type Cliente = typeof clientesTable.$inferSelect;

export const clientesTableColumns: ColumnDef<Cliente>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "phoneNumber",
    accessorKey: "phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const cliente = params.row.original;
      const phoneNumber = cliente.phoneNumber;
      if (!phoneNumber) return "";
      const formatted = phoneNumber.replace(
        /(\d{2})(\d{5})(\d{4})/,
        "($1) $2-$3",
      );
      return formatted;
    },
  },
  {
    id: "sex",
    accessorKey: "sex",
    header: "Sexo",
    cell: (params) => {
      const cliente = params.row.original;
      return cliente.sex === "male" ? "Masculino" : "Feminino";
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const cliente = params.row.original;
      return <ClientesTableActions patient={cliente} />;
    },
  },
];
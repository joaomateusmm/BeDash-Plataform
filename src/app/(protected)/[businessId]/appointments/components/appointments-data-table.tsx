"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable, profissionaisTable, clientesTable } from "@/db/schema";

import { appointmentsTableColumns } from "./table-columns";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
  };
};

interface AppointmentsDataTableProps {
  appointments: AppointmentWithRelations[];
  clientes: (typeof clientesTable.$inferSelect)[];
  profissionais: (typeof profissionaisTable.$inferSelect)[];
}

const AppointmentsDataTable = ({
  appointments,
  clientes,
  profissionais,
}: AppointmentsDataTableProps) => {
  const columns = appointmentsTableColumns(clientes, profissionais);

  return <DataTable data={appointments} columns={columns} />;
};

export default AppointmentsDataTable;

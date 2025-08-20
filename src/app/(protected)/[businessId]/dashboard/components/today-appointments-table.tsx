"use client";

import { DataTable } from "@/components/ui/data-table";
import { profissionaisTable, clientesTable } from "@/db/schema";
import { appointmentsTableColumns } from "../../appointments/components/table-columns";

type AppointmentWithRelations = {
  id: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: string;
  priceInCents: number;
  patientId: string;
  doctorId: string;
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

interface TodayAppointmentsTableProps {
  appointments: AppointmentWithRelations[];
  clientes: (typeof clientesTable.$inferSelect)[];
  profissionais: (typeof profissionaisTable.$inferSelect)[];
}

const TodayAppointmentsTable = ({
  appointments,
  clientes,
  profissionais,
}: TodayAppointmentsTableProps) => {
  const columns = appointmentsTableColumns(clientes, profissionais);

  return <DataTable data={appointments} columns={columns} />;
};

export default TodayAppointmentsTable;

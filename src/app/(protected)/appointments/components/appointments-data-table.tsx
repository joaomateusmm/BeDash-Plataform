"use client";

import { DataTable } from "@/components/ui/data-table";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

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
    specialty: string;
  };
};

interface AppointmentsDataTableProps {
  appointments: AppointmentWithRelations[];
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const AppointmentsDataTable = ({
  appointments,
  patients,
  doctors,
}: AppointmentsDataTableProps) => {
  const columns = appointmentsTableColumns(patients, doctors);

  return <DataTable data={appointments} columns={columns} />;
};

export default AppointmentsDataTable;

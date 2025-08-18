"use client";

import { DataTable } from "@/components/ui/data-table";
import { doctorsTable, patientsTable } from "@/db/schema";
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
    specialty: string;
  };
};

interface TodayAppointmentsTableProps {
  appointments: AppointmentWithRelations[];
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const TodayAppointmentsTable = ({
  appointments,
  patients,
  doctors,
}: TodayAppointmentsTableProps) => {
  const columns = appointmentsTableColumns(patients, doctors);

  return <DataTable data={appointments} columns={columns} />;
};

export default TodayAppointmentsTable;

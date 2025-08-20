import { z } from "zod";

export const TrialUsageSchema = z.object({
  currentClients: z.number().min(0),
  currentDoctors: z.number().min(0),
  currentAppointmentsThisMonth: z.number().min(0),
  currentFunctions: z.number().min(0),
  businessId: z.string().optional(),
});

export type TrialUsageData = z.infer<typeof TrialUsageSchema>;

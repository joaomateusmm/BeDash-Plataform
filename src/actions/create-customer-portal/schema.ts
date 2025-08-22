import { z } from "zod";

export const createCustomerPortalSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
});

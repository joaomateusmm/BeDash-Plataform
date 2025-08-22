import { z } from "zod";

export const createStripeCheckoutSchema = z.object({
  plan: z.enum(["basico", "professional", "advanced"]),
  billingPeriod: z.enum(["monthly", "yearly"]),
  businessId: z.string(),
});

export type CreateStripeCheckoutInput = z.infer<
  typeof createStripeCheckoutSchema
>;

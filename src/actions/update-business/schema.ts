import { z } from "zod";

export const updateBusinessSchema = z.object({
  id: z.string().uuid({
    message: "ID da empresa é obrigatório.",
  }),
  name: z.string().trim().min(1, {
    message: "Nome da empresa é obrigatório.",
  }),
});

export type UpdateBusinessSchema = z.infer<typeof updateBusinessSchema>;

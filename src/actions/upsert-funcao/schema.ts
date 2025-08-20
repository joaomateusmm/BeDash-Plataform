import { z } from "zod";

export const upsertFuncaoSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

export type UpsertFuncaoSchema = z.infer<typeof upsertFuncaoSchema>;

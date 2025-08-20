import { z } from "zod";

export const upsertclienteschema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  email: z
    .string()
    .email({
      message: "Email inválido.",
    })
    .or(z.literal("")),
  phoneNumber: z.string(),
  sex: z.enum(["male", "female"], {
    error: "Sexo é obrigatório.",
  }),
});

export type Upsertclienteschema = z.infer<typeof upsertclienteschema>;

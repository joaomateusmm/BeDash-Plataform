import { z } from "zod";

const attachmentSchema = z.object({
  type: z.enum(["image", "document"]),
  name: z.string(),
  url: z.string(),
  size: z.number(),
  content: z.string().optional(),
});

export const chatWithAiSchema = z.object({
  message: z
    .string()
    .min(1, "A mensagem é obrigatória")
    .max(4000, "A mensagem é muito longa"),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        attachments: z.array(attachmentSchema).optional(),
      }),
    )
    .optional()
    .default([]),
  attachments: z.array(attachmentSchema).optional().default([]),
});

export type ChatWithAiInput = z.infer<typeof chatWithAiSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;

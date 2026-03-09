import { z } from "zod";

export const messageStatusSchema = z.enum([
  "sending",
  "sent",
  "delivered",
  "failed",
]);

export const messageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  senderId: z.string(),
  content: z.string(),
  status: messageStatusSchema,
  clientId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type MessageSchema = z.infer<typeof messageSchema>;

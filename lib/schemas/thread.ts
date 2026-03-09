import { z } from "zod";

export const threadSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  visitorId: z.string(),
  summary: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastMessageAt: z.string().nullable().optional(),
});

export type ThreadSchema = z.infer<typeof threadSchema>;

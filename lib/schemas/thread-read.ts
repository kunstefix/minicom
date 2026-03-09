import { z } from "zod";

export const threadReadSchema = z.object({
  threadId: z.string(),
  participantId: z.string(),
  lastReadAt: z.string(),
});

export type ThreadReadSchema = z.infer<typeof threadReadSchema>;

import { z } from "zod";

export const participantRoleSchema = z.enum(["agent", "visitor"]);

export const participantSchema = z.object({
  id: z.string(),
  role: participantRoleSchema,
  displayName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export type ParticipantSchema = z.infer<typeof participantSchema>;

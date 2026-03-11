import type { Participant, Thread, Message, ThreadReadState } from "@/types/chat";
import type { ProfileRow, ThreadRow, MessageRow, ThreadReadRow } from "@/types/database";

export function mapProfileRowToParticipant(row: ProfileRow): Participant {
  return {
    id: row.id,
    role: (row.role === "agent" || row.role === "visitor" ? row.role : "visitor") as Participant["role"],
    displayName: row.display_name ?? null,
    avatarUrl: row.avatar_url ?? null,
  };
}

export function mapThreadRowToThread(row: ThreadRow): Thread {
  return {
    id: row.id,
    agentId: row.agent_id,
    visitorId: row.visitor_id,
    summary: row.summary ?? null,
    status: row.status ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Row from get_threads_for_agent_with_preview RPC (thread columns + preview). */
export interface ThreadWithPreviewRow extends ThreadRow {
  preview: string | null;
}

export function mapThreadWithPreviewRowToThread(row: ThreadWithPreviewRow): Thread {
  return {
    ...mapThreadRowToThread(row),
    preview: row.preview ?? null,
  };
}

export function mapMessageRowToMessage(row: MessageRow): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    content: row.content,
    status: row.status as Message["status"],
    clientId: row.client_id ?? null,
    createdAt: row.created_at,
  };
}

export function mapThreadReadRowToReadState(row: ThreadReadRow): ThreadReadState {
  return {
    threadId: row.thread_id,
    participantId: row.participant_id,
    lastReadAt: row.last_read_at,
  };
}

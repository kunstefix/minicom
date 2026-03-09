/**
 * MiniCom domain types for chat, participants, and UI state.
 */

export type ParticipantRole = "agent" | "visitor";

export type MessageStatus = "sending" | "sent" | "delivered" | "failed";

export interface Participant {
  id: string;
  role: ParticipantRole;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface Thread {
  id: string;
  agentId: string;
  visitorId: string;
  summary?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | null;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  clientId?: string | null;
  createdAt: string;
}

export interface ThreadReadState {
  threadId: string;
  participantId: string;
  lastReadAt: string;
}

export interface TypingPayload {
  threadId: string;
  participantId: string;
  isTyping: boolean;
}

export type InboxSortMode = "recent" | "unread";

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

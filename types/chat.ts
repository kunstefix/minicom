/**
 * MiniCom domain types for chat, participants, and UI state.
 */

export type ParticipantRole = "agent" | "visitor";

export type MessageStatus = "sending" | "sent" | "failed";

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
  /** First ~50 chars of latest message; from inbox query or set when message sent/received. */
  preview?: string | null;
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

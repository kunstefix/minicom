import type { Message, Thread, TypingPayload } from "@/types/chat";
import type { PresencePayload } from "@/lib/supabase/presence";
import type { ChatState } from "./chat-store";

/**
 * Merged messages for a thread: confirmed + optimistic, sorted by createdAt.
 */
export function selectMergedThreadMessages(
  state: ChatState,
  threadId: string
): Message[] {
  const confirmed = state.messagesByThreadId[threadId] ?? [];
  const optimistic = state.optimisticMessagesByThreadId[threadId] ?? [];
  const byCreated = (a: Message, b: Message) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const combined = [...confirmed];
  for (const opt of optimistic) {
    if (!combined.some((m) => m.clientId && m.clientId === opt.clientId))
      combined.push(opt);
  }
  return combined.sort(byCreated);
}

/**
 * Sorted inbox threads (for agent view). Uses inboxSortMode.
 */
export function selectSortedInbox(
  state: ChatState,
  agentId: string
): Thread[] {
  const threads = Object.values(state.threadsById).filter(
    (t) => t.agentId === agentId
  );
  if (state.inboxSortMode === "unread") {
    const readKey = (t: Thread) =>
      state.threadReadByKey[`${t.id}:${agentId}`]?.lastReadAt ?? "";
    return [...threads].sort(
      (a, b) =>
        new Date(readKey(b)).getTime() - new Date(readKey(a)).getTime()
    );
  }
  return [...threads].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Unread count for a participant (threads where last message is after lastReadAt).
 */
export function selectUnreadCount(
  state: ChatState,
  participantId: string
): number {
  let count = 0;
  for (const thread of Object.values(state.threadsById)) {
    const key = `${thread.id}:${participantId}`;
    const lastRead = state.threadReadByKey[key]?.lastReadAt;
    const messages = state.messagesByThreadId[thread.id] ?? [];
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.senderId !== participantId) {
      if (!lastRead || new Date(lastMsg.createdAt) > new Date(lastRead))
        count++;
    }
  }
  return count;
}

export function selectSelectedThread(state: ChatState): Thread | null {
  const id = state.selectedThreadId;
  return id ? state.threadsById[id] ?? null : null;
}

export function selectSelectedThreadMessages(state: ChatState): Message[] {
  const id = state.selectedThreadId;
  return id ? selectMergedThreadMessages(state, id) : [];
}

export function selectCurrentTypingState(
  state: ChatState,
  threadId: string | null
): TypingPayload[] {
  if (!threadId) return [];
  return state.typingByThreadId[threadId] ?? [];
}

export function selectCurrentPresenceState(
  state: ChatState,
  threadId: string | null
): PresencePayload[] {
  if (!threadId) return [];
  return state.presenceByThreadId[threadId] ?? [];
}

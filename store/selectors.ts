import type { Message, Thread } from "@/types/chat";
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
 * - "recent": all threads, sorted by updatedAt desc.
 * - "unread": threads with unread messages plus the currently selected thread (so it stays visible until you pick another), sorted by updatedAt desc.
 */
export function selectSortedInbox(
  state: ChatState,
  agentId: string
): Thread[] {
  let threads = Object.values(state.threadsById).filter(
    (t) => t.agentId === agentId
  );
  if (state.inboxSortMode === "unread") {
    const selectedId = state.selectedThreadId;
    threads = threads.filter(
      (t) =>
        t.id === selectedId ||
        selectUnreadCountForThread(state, t.id, agentId) > 0
    );
  }
  return [...threads].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function selectUnreadCountForThread(
  state: ChatState,
  threadId: string,
  participantId: string
): number {
  const key = `${threadId}:${participantId}`;
  const lastRead = state.threadReadByKey[key]?.lastReadAt;
  const messages = state.messagesByThreadId[threadId] ?? [];
  if (!lastRead) {
    return messages.filter((m) => m.senderId !== participantId).length;
  }
  const cutoff = new Date(lastRead).getTime();
  return messages.filter(
    (m) => m.senderId !== participantId && new Date(m.createdAt).getTime() > cutoff
  ).length;
}

export function selectCurrentPresenceState(
  state: ChatState,
  threadId: string | null
): PresencePayload[] {
  if (!threadId) return [];
  return state.presenceByThreadId[threadId] ?? [];
}

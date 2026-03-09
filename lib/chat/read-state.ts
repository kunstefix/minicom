import type { Message } from "@/types/chat";

/**
 * Unread count: messages in the thread after lastReadAt that are from the other participant.
 */
export function getUnreadCount(
  messages: Message[],
  lastReadAt: string | null,
  currentParticipantId: string
): number {
  if (!lastReadAt) return messages.filter((m) => m.senderId !== currentParticipantId).length;
  const cutoff = new Date(lastReadAt).getTime();
  return messages.filter(
    (m) =>
      m.senderId !== currentParticipantId &&
      new Date(m.createdAt).getTime() > cutoff
  ).length;
}

/**
 * Whether there are unread messages (for badge).
 */
export function hasUnread(
  messages: Message[],
  lastReadAt: string | null,
  currentParticipantId: string
): boolean {
  return getUnreadCount(messages, lastReadAt, currentParticipantId) > 0;
}

/**
 * Last read timestamp for a thread/participant; use for "visible read" updates.
 */
export function getLastReadAt(
  threadReadState: { lastReadAt: string } | null
): string | null {
  return threadReadState?.lastReadAt ?? null;
}

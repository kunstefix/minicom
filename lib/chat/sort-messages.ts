import type { Message } from "@/types/chat";

/**
 * Sort messages for render: by createdAt ascending (oldest first).
 */
export function sortMessagesForRender(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

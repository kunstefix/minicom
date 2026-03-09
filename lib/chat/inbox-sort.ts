import type { Thread } from "@/types/chat";

export type InboxSortMode = "recent" | "unread";

export interface ThreadWithRead {
  thread: Thread;
  lastReadAt: string | null;
  lastMessageAt: string | null;
}

/**
 * Stable sort: recent (by updatedAt desc) or unread (unread first, then by updatedAt).
 */
export function sortInbox(
  threads: Thread[],
  mode: InboxSortMode,
  getLastRead: (threadId: string) => string | null,
  getLastMessageAt: (threadId: string) => string | null
): Thread[] {
  const withMeta: ThreadWithRead[] = threads.map((thread) => ({
    thread,
    lastReadAt: getLastRead(thread.id),
    lastMessageAt: getLastMessageAt(thread.id),
  }));

  if (mode === "unread") {
    return [...withMeta]
      .sort((a, b) => {
        const aUnread = isUnread(a);
        const bUnread = isUnread(b);
        if (aUnread && !bUnread) return -1;
        if (!aUnread && bUnread) return 1;
        return byUpdated(b.thread, a.thread);
      })
      .map((x) => x.thread);
  }

  return [...withMeta]
    .sort((a, b) => byUpdated(b.thread, a.thread))
    .map((x) => x.thread);

  function isUnread(x: ThreadWithRead): boolean {
    const lastMsg = x.lastMessageAt;
    const lastRead = x.lastReadAt;
    if (!lastMsg) return false;
    if (!lastRead) return true;
    return new Date(lastMsg) > new Date(lastRead);
  }

  function byUpdated(a: Thread, b: Thread): number {
    return (
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
  }
}

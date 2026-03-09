"use client";

import { useCallback, useRef, useEffect } from "react";
import type { Thread } from "@/types/chat";
import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/store/chat-store";
import { selectSortedInbox, selectUnreadCountForThread } from "@/store/selectors";
import { InboxListItem } from "./inbox-list-item";
import { InboxToolbar } from "./inbox-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface InboxListProps {
  agentId: string;
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  className?: string;
}

export function InboxList({
  agentId,
  selectedThreadId,
  onSelectThread,
  className,
}: InboxListProps) {
  const threads = useChatStore(useShallow((s) => selectSortedInbox(s, agentId)));
  const inboxSortMode = useChatStore((s) => s.inboxSortMode);
  const setInboxSortMode = useChatStore((s) => s.setInboxSortMode);
  const messagesByThreadId = useChatStore((s) => s.messagesByThreadId);
  const threadReadByKey = useChatStore((s) => s.threadReadByKey);

  const getUnread = useCallback(
    (thread: Thread) =>
      selectUnreadCountForThread(
        { messagesByThreadId, threadReadByKey } as Parameters<
          typeof selectUnreadCountForThread
        >[0],
        thread.id,
        agentId
      ),
    [messagesByThreadId, threadReadByKey, agentId]
  );
  const getPreview = (thread: Thread) => {
    const msgs = messagesByThreadId[thread.id] ?? [];
    const last = msgs[msgs.length - 1];
    return last?.content?.slice(0, 50) ?? null;
  };

  const listRef = useRef<HTMLUListElement>(null);
  const focusedIndexRef = useRef(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (threads.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusedIndexRef.current = Math.min(
          focusedIndexRef.current + 1,
          threads.length - 1
        );
        (listRef.current?.children[focusedIndexRef.current] as HTMLElement)
          ?.querySelector("button")
          ?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
        (listRef.current?.children[focusedIndexRef.current] as HTMLElement)
          ?.querySelector("button")
          ?.focus();
      } else if (e.key === "Enter" && selectedThreadId) {
        const idx = threads.findIndex((t) => t.id === selectedThreadId);
        if (idx >= 0) (listRef.current?.children[idx] as HTMLElement)?.querySelector("button")?.focus();
      }
    },
    [threads.length, threads, selectedThreadId]
  );

  useEffect(() => {
    focusedIndexRef.current = threads.findIndex((t) => t.id === selectedThreadId);
    if (focusedIndexRef.current < 0) focusedIndexRef.current = 0;
  }, [threads, selectedThreadId]);

  return (
    <div
      className={cn("flex flex-col", className)}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label="Conversations"
    >
      <InboxToolbar
        sortMode={inboxSortMode}
        onSortModeChange={setInboxSortMode}
      />
      <div className="flex-1 overflow-y-auto p-2">
        {threads.length === 0 ? (
          <EmptyState title="No conversations" description="New threads will appear here." />
        ) : (
          <ul className="flex flex-col gap-1" role="list" ref={listRef}>
            {threads.map((thread) => (
              <li key={thread.id} role="option" aria-selected={selectedThreadId === thread.id}>
                <InboxListItem
                  thread={thread}
                  isSelected={selectedThreadId === thread.id}
                  unreadCount={getUnread(thread)}
                  preview={getPreview(thread)}
                  onClick={() => onSelectThread(thread.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

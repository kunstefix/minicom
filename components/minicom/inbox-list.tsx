"use client";

import { useCallback, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Thread } from "@/types/chat";
import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/store/chat-store";
import { selectSortedInbox, selectUnreadCountForThread } from "@/store/selectors";
import { InboxListItem } from "./inbox-list-item";
import { InboxToolbar } from "./inbox-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 72;

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const focusedIndexRef = useRef(0);

  const rowVirtualizer = useVirtualizer({
    count: threads.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

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
  const getPreview = (thread: Thread) =>
    thread.preview ??
    (() => {
      const msgs = messagesByThreadId[thread.id] ?? [];
      const last = msgs[msgs.length - 1];
      return last?.content?.slice(0, 50) ?? null;
    })();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (threads.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusedIndexRef.current = Math.min(
          focusedIndexRef.current + 1,
          threads.length - 1
        );
        rowVirtualizer.scrollToIndex(focusedIndexRef.current);
        setTimeout(() => {
          rowRefs.current
            .get(focusedIndexRef.current)
            ?.querySelector("button")
            ?.focus();
        }, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusedIndexRef.current = Math.max(focusedIndexRef.current - 1, 0);
        rowVirtualizer.scrollToIndex(focusedIndexRef.current);
        setTimeout(() => {
          rowRefs.current
            .get(focusedIndexRef.current)
            ?.querySelector("button")
            ?.focus();
        }, 0);
      } else if (e.key === "Enter" && selectedThreadId) {
        const idx = threads.findIndex((t) => t.id === selectedThreadId);
        if (idx >= 0) {
          rowRefs.current.get(idx)?.querySelector("button")?.focus();
        }
      }
    },
    [threads.length, threads, selectedThreadId, rowVirtualizer]
  );

  useEffect(() => {
    focusedIndexRef.current = threads.findIndex((t) => t.id === selectedThreadId);
    if (focusedIndexRef.current < 0) focusedIndexRef.current = 0;
  }, [threads, selectedThreadId]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      onKeyDown={handleKeyDown}
      role="listbox"
      aria-label="Conversations"
    >
      <InboxToolbar
        sortMode={inboxSortMode}
        onSortModeChange={setInboxSortMode}
      />
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto p-2"
        role="list"
      >
        {threads.length === 0 ? (
          <EmptyState
            title="No conversations"
            description="New threads will appear here."
          />
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const thread = threads[virtualRow.index];
              return (
                <div
                  key={thread.id}
                  ref={(el) => {
                    if (el) rowRefs.current.set(virtualRow.index, el);
                  }}
                  role="option"
                  aria-selected={selectedThreadId === thread.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="pb-1"
                >
                  <InboxListItem
                    thread={thread}
                    isSelected={selectedThreadId === thread.id}
                    unreadCount={
                      selectedThreadId === thread.id ? 0 : getUnread(thread)
                    }
                    preview={getPreview(thread)}
                    onClick={() => onSelectThread(thread.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Message } from "@/types/chat";
import type { Participant } from "@/types/chat";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { cn } from "@/lib/utils";

const ROW_ESTIMATE = 80; /* message + gap */
const TYPING_BLOCK_HEIGHT = 36; /* typing indicator natural height + pt-1 */

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  participantsById: Record<string, Participant>;
  showTyping?: boolean;
  /** Called when user taps Retry on a failed message. */
  onRetryMessage?: (message: Message) => void;
  className?: string;
}

export function MessageList({
  messages,
  currentUserId,
  participantsById,
  showTyping = false,
  onRetryMessage,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useAutoScroll(scrollRef, `${messages.length}-${showTyping}`);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 5,
    getItemKey: (index) => messages[index]?.id ?? messages[index]?.clientId ?? String(index),
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalMessageHeight = rowVirtualizer.getTotalSize();
  const totalHeight =
    totalMessageHeight + (showTyping ? TYPING_BLOCK_HEIGHT : 0);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex flex-1 flex-col overflow-y-auto p-3",
        className
      )}
      role="log"
      aria-label="Chat messages"
    >
      {messages.length === 0 && !showTyping ? (
        <EmptyState title="No messages yet" description="Say hello!" />
      ) : (
        <div style={{ minHeight: `${totalHeight}px` }}>
          <div
            style={{
              height: `${totalMessageHeight}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const msg = messages[virtualRow.index];
              if (!msg) return null;
              return (
                <div
                  key={msg.id || msg.clientId}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <MessageItem
                    message={msg}
                    isOwn={msg.senderId === currentUserId}
                    sender={participantsById[msg.senderId]}
                    showTimestamp={virtualRow.index === messages.length - 1}
                    onRetry={onRetryMessage}
                  />
                </div>
              );
            })}
          </div>
          {showTyping && (
            <div className="flex justify-start pt-1">
              <TypingIndicator visible />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

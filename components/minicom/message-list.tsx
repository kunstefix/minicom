"use client";

import { useRef } from "react";
import type { Message } from "@/types/chat";
import type { Participant } from "@/types/chat";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";
import { EmptyState } from "@/components/ui/empty-state";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { cn } from "@/lib/utils";

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
  useAutoScroll(scrollRef, messages.length);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex flex-1 flex-col gap-2 overflow-y-auto p-3",
        className
      )}
      role="log"
      aria-label="Chat messages"
    >
      {messages.length === 0 && !showTyping ? (
        <EmptyState title="No messages yet" description="Say hello!" />
      ) : (
        <>
          {messages.map((msg) => (
            <MessageItem
              key={msg.id || msg.clientId}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              sender={participantsById[msg.senderId]}
              onRetry={onRetryMessage}
            />
          ))}
          <div className="flex justify-start">
            <TypingIndicator visible={showTyping} />
          </div>
        </>
      )}
    </div>
  );
}

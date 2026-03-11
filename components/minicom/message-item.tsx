"use client";

import type { Message } from "@/types/chat";
import type { Participant } from "@/types/chat";
import { formatMessageTime } from "@/lib/format-message-time";
import { cn } from "@/lib/utils";
import { MessageStatusDot } from "./message-status";
import { Button } from "@/components/ui/button";

export interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  sender?: Participant | null;
  /** Show short timestamp next to status (e.g. for last message). */
  showTimestamp?: boolean;
  /** Called when user taps Retry for a failed message (own messages only). */
  onRetry?: (message: Message) => void;
  className?: string;
}

export function MessageItem({
  message,
  isOwn,
  sender,
  showTimestamp = false,
  onRetry,
  className,
}: MessageItemProps) {
  const showRetry =
    isOwn && message.status === "failed" && onRetry && message.clientId;

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isOwn && "flex-row-reverse",
        className
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] flex-col",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          {!isOwn && sender?.displayName && (
            <p className="mb-0.5 text-xs font-medium opacity-80">
              {sender.displayName}
            </p>
          )}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <div
          className={cn(
            "mt-0.5 flex min-h-5 items-center gap-1.5 flex-wrap",
            isOwn ? "justify-end" : "justify-start"
          )}
        >
          <MessageStatusDot status={message.status} showLabel={message.status !== "sent"} />
          {showTimestamp && (
            <span className="text-[11px] text-muted-foreground/70" aria-label={`Sent ${formatMessageTime(message.createdAt)}`}>
              {formatMessageTime(message.createdAt)}
            </span>
          )}
          {showRetry && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-xs text-destructive hover:text-destructive"
              onClick={() => onRetry(message)}
              aria-label="Retry sending"
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

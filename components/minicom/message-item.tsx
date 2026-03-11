"use client";

import type { Message } from "@/types/chat";
import type { Participant } from "@/types/chat";
import { cn } from "@/lib/utils";
import { MessageStatusDot } from "./message-status";
import { Button } from "@/components/ui/button";

export interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  sender?: Participant | null;
  /** Called when user taps Retry for a failed message (own messages only). */
  onRetry?: (message: Message) => void;
  className?: string;
}

export function MessageItem({
  message,
  isOwn,
  sender,
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
          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
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
        <div className="mt-1 flex min-h-5 items-center justify-end gap-1.5 flex-wrap">
          <MessageStatusDot status={message.status} showLabel={message.status !== "sent"} />
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

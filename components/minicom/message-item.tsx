"use client";

import type { Message } from "@/types/chat";
import type { Participant } from "@/types/chat";
import { cn } from "@/lib/utils";
import { MessageStatusDot } from "./message-status";

export interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  sender?: Participant | null;
  className?: string;
}

export function MessageItem({
  message,
  isOwn,
  sender,
  className,
}: MessageItemProps) {
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
        <div className="mt-1 flex items-center justify-end gap-1">
          <MessageStatusDot status={message.status} />
        </div>
      </div>
    </div>
  );
}

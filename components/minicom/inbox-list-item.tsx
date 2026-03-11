"use client";

import type { Thread } from "@/types/chat";
import { UnreadBadge } from "./unread-badge";
import { cn } from "@/lib/utils";

export interface InboxListItemProps {
  thread: Thread;
  isSelected?: boolean;
  unreadCount?: number;
  preview?: string | null;
  onClick?: () => void;
  className?: string;
}

export function InboxListItem({
  thread,
  isSelected = false,
  unreadCount = 0,
  preview,
  onClick,
  className,
}: InboxListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-muted",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium"
          style={{
            color: `hsl(${Array.from(thread.visitorId)
              .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360}, 70%, 60%)`,
          }}
        >
          Thread {thread.visitorId.slice(0, 8)}…
        </p>
        {preview && (
          <p className="truncate text-xs text-muted-foreground">{preview}</p>
        )}
      </div>
      {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
    </button>
  );
}

"use client";

import type { Thread } from "@/types/chat";
import { formatMessageTime } from "@/lib/format-message-time";
import { UnreadBadge } from "./unread-badge";
import { cn } from "@/lib/utils";

export interface InboxListItemProps {
  thread: Thread;
  isSelected?: boolean;
  unreadCount?: number;
  preview?: string | null;
  /** Last message createdAt (ISO) for preview timestamp. */
  lastMessageCreatedAt?: string | null;
  onClick?: () => void;
  tabIndex?: number;
  onFocus?: () => void;
  className?: string;
}

export function InboxListItem({
  thread,
  isSelected = false,
  unreadCount = 0,
  preview,
  lastMessageCreatedAt,
  onClick,
  tabIndex,
  onFocus,
  className,
}: InboxListItemProps) {
  const hue =
    Array.from(thread.visitorId).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    ) % 360;
  const initials = thread.visitorId.slice(0, 2).toUpperCase() || "??";

  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={tabIndex}
      onFocus={onFocus}
      className={cn(
        "flex h-full min-h-[72px] w-full items-center justify-between gap-3 border-b border-border px-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-muted/50",
        className
      )}
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: `hsl(${hue}, 65%, 45%)` }}
        aria-hidden
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className="truncate text-sm font-medium"
          >
            {thread.visitorId.slice(0, 8)}…
          </p>
          {lastMessageCreatedAt && (
            <span className="shrink-0 text-[11px] text-muted-foreground/70">
              {formatMessageTime(lastMessageCreatedAt)}
            </span>
          )}
        </div>
        <p className="min-h-5 truncate text-xs text-muted-foreground">
          {preview ?? "\u00A0"}
        </p>
      </div>
      {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
    </button>
  );
}

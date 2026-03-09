"use client";

import type { InboxSortMode } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface InboxToolbarProps {
  sortMode: InboxSortMode;
  onSortModeChange: (mode: InboxSortMode) => void;
  className?: string;
}

export function InboxToolbar({
  sortMode,
  onSortModeChange,
  className,
}: InboxToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-border p-2",
        className
      )}
    >
      <Button
        variant={sortMode === "recent" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onSortModeChange("recent")}
      >
        Recent
      </Button>
      <Button
        variant={sortMode === "unread" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onSortModeChange("unread")}
      >
        Unread
      </Button>
    </div>
  );
}

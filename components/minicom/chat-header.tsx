"use client";

import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

export interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  status?: "online" | "offline" | "away";
  onClose?: () => void;
  className?: string;
}

export function ChatHeader({
  title,
  subtitle,
  status = "offline",
  onClose,
  className,
}: ChatHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-3 py-2",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <StatusDot status={status} />
        <div className="min-w-0">
          <p className="truncate font-medium">{title}</p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      )}
    </div>
  );
}

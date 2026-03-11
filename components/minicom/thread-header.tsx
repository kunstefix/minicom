"use client";

import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

export interface ThreadHeaderProps {
  title: string;
  subtitle?: string;
  status?: "online" | "offline" | "away";
  onBack?: () => void;
  className?: string;
}

export function ThreadHeader({
  title,
  subtitle,
  status,
  onBack,
  className,
}: ThreadHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-border px-3 py-2",
        className
      )}
    >
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back to inbox"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {status != null && <StatusDot status={status} />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{title}</p>
          {subtitle != null && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

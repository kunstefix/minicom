"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ThreadHeaderProps {
  title: string;
  onBack?: () => void;
  className?: string;
}

export function ThreadHeader({
  title,
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
      <p className="flex-1 truncate font-medium">{title}</p>
    </div>
  );
}

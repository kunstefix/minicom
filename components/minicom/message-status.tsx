import type { MessageStatus } from "@/types/chat";
import { cn } from "@/lib/utils";

export interface MessageStatusProps {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusDot({ status, className }: MessageStatusProps) {
  return (
    <span
      className={cn(
        "inline-block size-1.5 rounded-full shrink-0",
        status === "sending" && "bg-amber-500 animate-pulse",
        status === "sent" && "bg-muted-foreground/50",
        status === "delivered" && "bg-green-500",
        status === "failed" && "bg-destructive",
        className
      )}
      title={status}
      aria-hidden
    />
  );
}

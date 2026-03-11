import type { MessageStatus } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader2, Check, XCircle } from "lucide-react";

export interface MessageStatusProps {
  status: MessageStatus;
  /** Optional label (e.g. "Sending", "Sent", "Failed") for accessibility/clarity. */
  showLabel?: boolean;
  className?: string;
}

const STATUS_LABELS: Record<MessageStatus, string> = {
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
};

export function MessageStatusDot({
  status,
  showLabel = false,
  className,
}: MessageStatusProps) {
  const iconClassName = cn(
    "shrink-0",
    status === "sending" && "text-amber-500 animate-spin",
    status === "sent" && "text-muted-foreground/70",
    status === "failed" && "text-destructive"
  );

  return (
    <span
      className={cn("inline-flex min-h-5 items-center gap-1", className)}
      title={STATUS_LABELS[status]}
      aria-label={STATUS_LABELS[status]}
    >
      {status === "sending" && (
        <Loader2 className={cn(iconClassName, "size-3")} aria-hidden />
      )}
      {status === "sent" && (
        <Check className={cn(iconClassName, "size-3")} aria-hidden />
      )}
      {status === "failed" && (
        <XCircle className={cn(iconClassName, "size-3")} aria-hidden />
      )}
      {showLabel && (
        <span className="text-[10px] opacity-80 capitalize">
          {STATUS_LABELS[status]}
        </span>
      )}
    </span>
  );
}

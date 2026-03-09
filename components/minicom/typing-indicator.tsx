import { cn } from "@/lib/utils";

export interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-lg bg-muted px-3 py-2",
        className
      )}
      aria-live="polite"
    >
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </div>
  );
}

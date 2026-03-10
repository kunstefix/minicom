import { cn } from "@/lib/utils";

export interface TypingIndicatorProps {
  /** When false, same layout/size but invisible (transparent placeholder). */
  visible?: boolean;
  className?: string;
}

export function TypingIndicator({
  visible = true,
  className,
}: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex gap-1 rounded-lg bg-muted px-3 py-2",
        !visible && "invisible",
        className
      )}
      aria-live={visible ? "polite" : "off"}
      aria-hidden={!visible}
    >
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </div>
  );
}

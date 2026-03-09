import { cn } from "@/lib/utils";

export interface StatusDotProps {
  status?: "online" | "offline" | "away";
  className?: string;
}

export function StatusDot({ status = "offline", className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full shrink-0",
        status === "online" && "bg-green-500",
        status === "away" && "bg-amber-500",
        status === "offline" && "bg-muted-foreground/50",
        className
      )}
      aria-hidden
    />
  );
}

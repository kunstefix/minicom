import { cn } from "@/lib/utils";

export interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-medium text-primary-foreground",
        className
      )}
      aria-label={`${count} unread`}
    >
      {label}
    </span>
  );
}

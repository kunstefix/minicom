import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = "No messages yet",
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground",
        className
      )}
    >
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="text-sm">{description}</p>}
      {children}
    </div>
  );
}

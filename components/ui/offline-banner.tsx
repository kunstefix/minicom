import { cn } from "@/lib/utils";

export interface OfflineBannerProps {
  className?: string;
  children?: React.ReactNode;
}

export function OfflineBanner({ className, children }: OfflineBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200",
        className
      )}
    >
      {children ?? "You're offline. Messages will send when back online."}
    </div>
  );
}

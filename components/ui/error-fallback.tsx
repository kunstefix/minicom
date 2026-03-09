import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorFallback({
  message = "Something went wrong.",
  onRetry,
  className,
}: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-6 text-center text-destructive",
        className
      )}
    >
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

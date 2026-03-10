"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDebouncedTypingIndicator } from "@/hooks/use-debounced-typing-indicator";

export interface MessageComposerProps {
  onSend: (content: string) => void | Promise<void>;
  onTypingChange?: (typing: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function MessageComposer({
  onSend,
  onTypingChange,
  disabled = false,
  placeholder = "Type a message...",
  className,
}: MessageComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const notifyTyping = useMemo(
    () => onTypingChange ?? (() => {}),
    [onTypingChange]
  );
  useDebouncedTypingIndicator(value, notifyTyping);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onTypingChange?.(false);
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend, onTypingChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleBlur = useCallback(() => {
    if (!value.trim()) onTypingChange?.(false);
  }, [value, onTypingChange]);

  return (
    <div
      className={cn(
        "flex gap-2 border-t border-border bg-background p-2",
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="min-h-9 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Message input"
      />
      <Button
        type="button"
        size="icon"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      </Button>
    </div>
  );
}

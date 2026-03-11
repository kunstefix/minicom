"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "./chat-widget";
import { saveWidgetOpen, loadWidgetOpen } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export interface ChatLauncherProps {
  className?: string;
}

export function ChatLauncher({ className }: ChatLauncherProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(loadWidgetOpen());
  }, []);

  const toggle = () => {
    if (closing) return;
    const next = !open;
    setOpen(next);
    saveWidgetOpen(next);
  };

  const close = useCallback(() => {
    setClosing(true);
    saveWidgetOpen(false);
  }, []);

  const handleAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.animationName === "minicom-chat-out") {
        setOpen(false);
        setClosing(false);
      }
    },
    []
  );

  const showWidget = open;
  const isExiting = closing;

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 size-14 rounded-full shadow-lg",
          className
        )}
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </Button>
      {showWidget && (
        <div
          ref={wrapperRef}
          className={cn(
            "fixed bottom-24 right-4 left-4 z-40 flex justify-end sm:left-auto sm:right-6",
            isExiting ? "minicom-chat-exit" : "minicom-chat-enter"
          )}
          onAnimationEnd={handleAnimationEnd}
        >
          <ChatWidget onClose={close} />
        </div>
      )}
    </>
  );
}

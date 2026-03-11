"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  subscribeToThreadMessages,
  unsubscribe,
} from "@/lib/supabase/subscriptions";
import { playNotificationSound } from "@/lib/notification-sound";
import { useChatStore } from "@/store/chat-store";
import { selectUnreadCountForThread } from "@/store/selectors";
import { useVisitorThread } from "@/hooks/use-visitor-thread";
import { Button } from "@/components/ui/button";
import { ChatWidget } from "./chat-widget";
import { UnreadBadge } from "./unread-badge";
import { saveWidgetOpen, loadWidgetOpen } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatLauncherProps {
  className?: string;
}

export function ChatLauncher({ className }: ChatLauncherProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const messageChannelRef = useRef<RealtimeChannel | null>(null);

  const { visitorThreadId } = useVisitorThread();
  const viewer = useChatStore((s) => s.viewer);
  const upsertMessage = useChatStore((s) => s.upsertMessage);
  const unreadCount = useChatStore((s) =>
    visitorThreadId && viewer
      ? selectUnreadCountForThread(s, visitorThreadId, viewer.id)
      : 0
  );

  useEffect(() => {
    setOpen(loadWidgetOpen());
  }, []);

  useEffect(() => {
    if (open || !visitorThreadId || !viewer) return;
    const supabase = createClient();
    const ch = subscribeToThreadMessages(supabase, visitorThreadId, (msg) => {
      upsertMessage(msg);
      if (msg.senderId !== viewer.id) playNotificationSound();
    });
    messageChannelRef.current = ch;
    return () => {
      unsubscribe(ch).catch(() => {});
      messageChannelRef.current = null;
    };
  }, [open, visitorThreadId, viewer?.id, upsertMessage]);

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
          "fixed bottom-6 right-6 z-50 size-14 rounded-full border-2 border-background shadow-lg",
          className
        )}
        onClick={toggle}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {unreadCount > 0 && !open && (
          <span className="absolute -right-1 -top-1">
            <UnreadBadge count={unreadCount} />
          </span>
        )}
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
        <>
          <button
            type="button"
            aria-label="Close chat"
            className="fixed inset-0 z-30 cursor-default sm:z-[35]"
            onClick={close}
            tabIndex={-1}
          />
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
        </>
      )}
    </>
  );
}

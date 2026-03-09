"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  subscribeToTyping,
  sendTypingStart,
  sendTypingStop,
  unsubscribeTyping,
} from "@/lib/supabase/typing";
import { useChatStore } from "@/store/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

const TYPING_DEBOUNCE_MS = 500;

export function useTypingBroadcast(
  threadId: string | null,
  participantId: string | null,
  isTyping: boolean
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!threadId || !participantId) return;

    const supabase = createClient();
    const ch = subscribeToTyping(supabase, threadId, () => {});
    channelRef.current = ch;

    return () => {
      unsubscribeTyping(ch);
      channelRef.current = null;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [threadId, participantId]);

  useEffect(() => {
    if (!threadId || !participantId || !channelRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isTyping) {
      sendTypingStart(channelRef.current, threadId, participantId);
      timeoutRef.current = setTimeout(() => {
        sendTypingStop(channelRef.current!, threadId, participantId);
        timeoutRef.current = null;
      }, TYPING_DEBOUNCE_MS);
    } else {
      sendTypingStop(channelRef.current, threadId, participantId);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [threadId, participantId, isTyping]);
}

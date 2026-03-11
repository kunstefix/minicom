"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  subscribeToTyping,
  sendTypingStart,
  sendTypingStop,
  unsubscribeTyping,
} from "@/lib/supabase/typing";
import type { RealtimeChannel } from "@supabase/supabase-js";

/** Send "typing" every this often while user is typing so the indicator stays visible */
const TYPING_HEARTBEAT_MS = 400;

export function useTypingBroadcast(
  threadId: string | null,
  participantId: string | null,
  isTyping: boolean
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!threadId || !participantId) return;

    const supabase = createClient();
    const ch = subscribeToTyping(supabase, threadId, () => {});
    channelRef.current = ch;

    return () => {
      unsubscribeTyping(ch);
      channelRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [threadId, participantId]);

  useEffect(() => {
    if (!threadId || !participantId || !channelRef.current) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isTyping) {
      sendTypingStart(channelRef.current, threadId, participantId);
      intervalRef.current = setInterval(() => {
        sendTypingStart(channelRef.current!, threadId, participantId);
      }, TYPING_HEARTBEAT_MS);
    } else {
      sendTypingStop(channelRef.current, threadId, participantId);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [threadId, participantId, isTyping]);
}

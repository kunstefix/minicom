"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMessagesForThread, markThreadRead } from "@/lib/supabase/queries";
import {
  subscribeToThreadMessages,
  subscribeToThreadUpdates,
  unsubscribe,
} from "@/lib/supabase/subscriptions";
import { subscribeToThreadPresence } from "@/lib/supabase/presence";
import { subscribeToTyping } from "@/lib/supabase/typing";
import { useChatStore } from "@/store/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useChatThread(threadId: string | null) {
  const {
    hydrateMessages,
    upsertMessage,
    setPresenceSnapshot,
    setTypingState,
    setConnectionState,
    markThreadReadLocal,
    viewer,
  } = useChatStore();
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const presenceCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!threadId || !viewer) return;

    const supabase = createClient();
    const channels: RealtimeChannel[] = [];

    const handleRealtimeStatus = (status: string) => {
      if (status === "SUBSCRIBED") setConnectionState("connected");
      if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setConnectionState("disconnected");
      }
    };

    (async () => {
      setConnectionState("connecting");
      try {
        const messages = await getMessagesForThread(supabase, threadId);
        hydrateMessages(threadId, messages);

        await markThreadRead(supabase, threadId, viewer.id);
        markThreadReadLocal(threadId, viewer.id, new Date().toISOString());

        const msgCh = subscribeToThreadMessages(
          supabase,
          threadId,
          (msg) => upsertMessage(msg),
          handleRealtimeStatus
        );
        channels.push(msgCh);

        const updCh = subscribeToThreadUpdates(supabase, threadId, () => {
          // Refetch thread if needed; store will be updated by inbox subscription or explicit fetch
        });
        channels.push(updCh);

        presenceCleanupRef.current = subscribeToThreadPresence(
          supabase,
          threadId,
          viewer.id,
          (list) => setPresenceSnapshot(threadId, list)
        );

        const typingCh = subscribeToTyping(supabase, threadId, (payload) => {
          const current =
            useChatStore.getState().typingByThreadId[threadId] ?? [];
          const next = payload.isTyping
            ? [
                ...current.filter((p) => p.participantId !== payload.participantId),
                payload,
              ]
            : current.filter((p) => p.participantId !== payload.participantId);
          setTypingState(threadId, next);
        });
        channels.push(typingCh);

        channelsRef.current = channels;
        // "connected" is set by handleRealtimeStatus when channel reports SUBSCRIBED
      } catch {
        setConnectionState("error");
      }
    })();

    return () => {
      presenceCleanupRef.current?.();
      presenceCleanupRef.current = null;
      Promise.all(
        channelsRef.current.map((ch) => unsubscribe(ch))
      ).catch(() => {});
      channelsRef.current = [];
      setConnectionState("disconnected");
    };
  }, [threadId, viewer, hydrateMessages, upsertMessage, setPresenceSnapshot, setTypingState, setConnectionState, markThreadReadLocal]);
}

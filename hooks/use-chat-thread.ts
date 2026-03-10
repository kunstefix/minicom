"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMessagesForThread, markThreadRead } from "@/lib/supabase/queries";
import {
  subscribeToThreadMessages,
  subscribeToThreadUpdates,
  unsubscribe,
} from "@/lib/supabase/subscriptions";
import {
  joinThreadPresence,
  onThreadPresenceSync,
  leaveThreadPresence,
} from "@/lib/supabase/presence";
import { subscribeToTyping, unsubscribeTyping } from "@/lib/supabase/typing";
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

  useEffect(() => {
    if (!threadId || !viewer) return;

    const supabase = createClient();
    const channels: RealtimeChannel[] = [];

    (async () => {
      setConnectionState("connecting");
      try {
        const messages = await getMessagesForThread(supabase, threadId);
        hydrateMessages(threadId, messages);

        await markThreadRead(supabase, threadId, viewer.id);
        markThreadReadLocal(threadId, viewer.id, new Date().toISOString());

        const msgCh = subscribeToThreadMessages(supabase, threadId, (msg) => {
          upsertMessage(msg);
        });
        channels.push(msgCh);

        const updCh = subscribeToThreadUpdates(supabase, threadId, () => {
          // Refetch thread if needed; store will be updated by inbox subscription or explicit fetch
        });
        channels.push(updCh);

        const presenceCh = joinThreadPresence(
          supabase,
          threadId,
          viewer.id,
          "online"
        );
        channels.push(presenceCh);
        onThreadPresenceSync(presenceCh, (state) => {
          const list = Object.values(state).flat();
          setPresenceSnapshot(threadId, list);
        });

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
        setConnectionState("connected");
      } catch {
        setConnectionState("error");
      }
    })();

    return () => {
      Promise.all(
        channelsRef.current.map((ch) => unsubscribe(ch))
      ).catch(() => {});
      channelsRef.current = [];
      setConnectionState("disconnected");
    };
  }, [threadId, viewer?.id, hydrateMessages, upsertMessage, setPresenceSnapshot, setTypingState, setConnectionState, markThreadReadLocal]);
}

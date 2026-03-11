"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getThreadById,
  getThreadsForAgentWithPreview,
} from "@/lib/supabase/queries";
import { subscribeToInboxUpdates, unsubscribe } from "@/lib/supabase/subscriptions";
import { useChatStore } from "@/store/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useAgentInbox(agentId: string | null) {
  const {
    hydrateThreads,
    setConnectionState,
    upsertMessage,
    upsertThread,
    bumpThreadUpdatedAt,
    setThreadPreview,
  } = useChatStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!agentId) return;

    const supabase = createClient();

    (async () => {
      setConnectionState("connecting");
      try {
        const threads = await getThreadsForAgentWithPreview(supabase, agentId);
        hydrateThreads(threads);

        const ch = subscribeToInboxUpdates(
          supabase,
          agentId,
          async () => {
            const next = await getThreadsForAgentWithPreview(supabase, agentId);
            hydrateThreads(next);
          },
          async (message) => {
            const thread = await getThreadById(supabase, message.threadId);
            if (thread?.agentId !== agentId) return;
            upsertThread(thread);
            upsertMessage(message);
            bumpThreadUpdatedAt(message.threadId);
            setThreadPreview(
              message.threadId,
              message.content.slice(0, 50) || null
            );
          }
        );
        channelRef.current = ch;
        setConnectionState("connected");
      } catch {
        setConnectionState("error");
      }
    })();

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
      setConnectionState("disconnected");
    };
  }, [
    agentId,
    hydrateThreads,
    setConnectionState,
    upsertMessage,
    upsertThread,
    bumpThreadUpdatedAt,
    setThreadPreview,
  ]);

  return {};
}

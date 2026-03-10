"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getThreadById, getThreadsForAgent } from "@/lib/supabase/queries";
import { subscribeToInboxUpdates, unsubscribe } from "@/lib/supabase/subscriptions";
import { useChatStore } from "@/store/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useAgentInbox(agentId: string | null) {
  const { hydrateThreads, setConnectionState, upsertMessage, upsertThread } =
    useChatStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!agentId) return;

    const supabase = createClient();

    (async () => {
      setConnectionState("connecting");
      try {
        const threads = await getThreadsForAgent(supabase, agentId);
        hydrateThreads(threads);

        const ch = subscribeToInboxUpdates(
          supabase,
          agentId,
          async () => {
            const next = await getThreadsForAgent(supabase, agentId);
            hydrateThreads(next);
          },
          async (message) => {
            const thread = await getThreadById(supabase, message.threadId);
            if (thread?.agentId !== agentId) return;
            upsertThread(thread);
            upsertMessage(message);
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
  ]);

  return {};
}

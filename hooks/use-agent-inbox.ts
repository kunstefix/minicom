"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getThreadById,
  getThreadsForAgentWithPreview,
} from "@/lib/supabase/queries";
import { subscribeToInboxUpdates, unsubscribe } from "@/lib/supabase/subscriptions";
import { subscribeToThreadPresence } from "@/lib/supabase/presence";
import { useChatStore } from "@/store/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

const MAX_PRESENCE_THREADS = 40;

export function useAgentInbox(agentId: string | null) {
  const {
    hydrateThreads,
    setPresenceSnapshot,
    setConnectionState,
    upsertMessage,
    upsertThread,
    bumpThreadUpdatedAt,
    setThreadPreview,
  } = useChatStore();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceCleanupsRef = useRef<(() => void)[]>([]);
  const subscribedPresenceIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!agentId) return;

    const supabase = createClient();

    const handleRealtimeStatus = (status: string) => {
      if (status === "SUBSCRIBED") setConnectionState("connected");
      if (status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setConnectionState("disconnected");
      }
    };

    function subscribePresenceForThreads(threads: { id: string }[], agent: string) {
      for (const thread of threads.slice(0, MAX_PRESENCE_THREADS)) {
        if (subscribedPresenceIdsRef.current.has(thread.id)) continue;
        subscribedPresenceIdsRef.current.add(thread.id);
        const threadId = thread.id;
        const cleanup = subscribeToThreadPresence(
          supabase,
          threadId,
          agent,
          (list) => setPresenceSnapshot(threadId, list)
        );
        presenceCleanupsRef.current.push(cleanup);
      }
    }

    (async () => {
      setConnectionState("connecting");
      try {
        const threads = await getThreadsForAgentWithPreview(supabase, agentId);
        hydrateThreads(threads);
        subscribePresenceForThreads(threads, agentId);

        const ch = subscribeToInboxUpdates(
          supabase,
          agentId,
          async () => {
            const next = await getThreadsForAgentWithPreview(supabase, agentId);
            hydrateThreads(next);
            subscribePresenceForThreads(next, agentId);
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
          },
          handleRealtimeStatus
        );
        channelRef.current = ch;
        // "connected" is set by handleRealtimeStatus when channel reports SUBSCRIBED
      } catch {
        setConnectionState("error");
      }
    })();

    return () => {
      const cleanups = presenceCleanupsRef.current;
      presenceCleanupsRef.current = [];
      cleanups.forEach((c) => c());
      subscribedPresenceIdsRef.current.clear();
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
      setConnectionState("disconnected");
    };
  }, [
    agentId,
    hydrateThreads,
    setPresenceSnapshot,
    setConnectionState,
    upsertMessage,
    upsertThread,
    bumpThreadUpdatedAt,
    setThreadPreview,
  ]);

  return {};
}

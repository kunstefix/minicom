"use client";

import { useEffect, useRef } from "react";
import { getOrCreateVisitor } from "@/lib/get-or-create-visitor";
import { getDefaultAgent } from "@/lib/get-default-agent";
import { createClient } from "@/lib/supabase/client";
import { createThread, getMessagesForThread } from "@/lib/supabase/queries";
import { subscribeToThreadMessages, unsubscribe } from "@/lib/supabase/subscriptions";
import { useChatStore } from "@/store/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Ensures the current visitor has a thread with the default agent, hydrates messages,
 * and subscribes to realtime updates. Returns the active visitor thread id.
 */
export function useVisitorThread() {
  const {
    setViewer,
    setVisitorThreadId,
    upsertThread,
    upsertParticipant,
    hydrateMessages,
    upsertMessage,
    threadsById,
  } = useChatStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Resolve or create visitor and set as viewer in store
      const participant = await getOrCreateVisitor();
      if (cancelled) return;
      setViewer(participant);

      // Load default agent and add to participants
      const agent = await getDefaultAgent();
      if (!agent || cancelled) return;
      upsertParticipant(agent);

      const supabase = createClient();
      // Reuse existing thread for this visitor+agent pair if present
      const existing = Object.values(threadsById).find(
        (t) => t.visitorId === participant.id && t.agentId === agent.id
      );

      if (existing) {
        setVisitorThreadId(existing.id);
        const messages = await getMessagesForThread(supabase, existing.id);
        if (!cancelled) hydrateMessages(existing.id, messages);
        const ch = subscribeToThreadMessages(supabase, existing.id, (msg) => {
          upsertMessage(msg);
        });
        channelRef.current = ch;
        return;
      }

      // Create new thread and subscribe to messages
      const thread = await createThread(supabase, agent.id, participant.id);
      if (cancelled) return;
      upsertThread(thread);
      setVisitorThreadId(thread.id);
      const ch = subscribeToThreadMessages(supabase, thread.id, (msg) => {
        upsertMessage(msg);
      });
      channelRef.current = ch;
    })();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const visitorThreadId = useChatStore((s) => s.visitorThreadId);
  return { visitorThreadId };
}

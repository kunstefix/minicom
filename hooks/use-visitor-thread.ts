"use client";

import { useEffect, useRef } from "react";
import { getOrCreateVisitor } from "@/lib/get-or-create-visitor";
import { getDefaultAgent } from "@/lib/get-default-agent";
import { createClient } from "@/lib/supabase/client";
import {
  getThreadById,
  createThread,
  getMessagesForThread,
} from "@/lib/supabase/queries";
import { subscribeToThreadMessages, unsubscribe } from "@/lib/supabase/subscriptions";
import { useChatStore } from "@/store/chat-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function useVisitorThread() {
  const {
    setViewer,
    setVisitorThreadId,
    upsertThread,
    hydrateMessages,
    upsertMessage,
    threadsById,
    visitorThreadId,
  } = useChatStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const participant = await getOrCreateVisitor();
      if (cancelled) return;
      setViewer(participant);

      const agent = await getDefaultAgent();
      if (!agent || cancelled) return;

      const supabase = createClient();
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

  return { visitorThreadId };
}

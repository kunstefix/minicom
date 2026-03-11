"use client";

import { useEffect } from "react";
import { getOrCreateVisitor } from "@/lib/get-or-create-visitor";
import { getDefaultAgent } from "@/lib/get-default-agent";
import { createClient } from "@/lib/supabase/client";
import {
  createThread,
  getMessagesForThread,
  getThreadByAgentAndVisitor,
} from "@/lib/supabase/queries";
import { useChatStore } from "@/store/chat-store";

/**
 * Ensures the current visitor has a thread with the default agent and hydrates
 * initial messages. Realtime message subscription is handled by useChatThread
 * in the widget (single subscription).
 */
export function useVisitorThread() {
  const {
    setViewer,
    setVisitorThreadId,
    upsertThread,
    upsertParticipant,
    hydrateMessages,
    threadsById,
  } = useChatStore();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    (async () => {
      const participant = await getOrCreateVisitor();
      if (cancelled) return;
      setViewer(participant);

      const agent = await getDefaultAgent();
      if (!agent || cancelled) return;
      upsertParticipant(agent);

      const supabase = createClient();
      // Prefer DB lookup first so new tabs (empty store) always get the existing thread
      let existing = await getThreadByAgentAndVisitor(
        supabase,
        agent.id,
        participant.id
      );
      if (!existing) {
        existing =
          Object.values(threadsById).find(
            (t) => t.visitorId === participant.id && t.agentId === agent.id
          ) ?? null;
      }

      if (existing) {
        upsertThread(existing);
        setVisitorThreadId(existing.id);
        const messages = await getMessagesForThread(supabase, existing.id);
        if (!cancelled) hydrateMessages(existing.id, messages);
        return;
      }

      const thread = await createThread(supabase, agent.id, participant.id);
      if (cancelled) return;
      upsertThread(thread);
      setVisitorThreadId(thread.id);
      const messages = await getMessagesForThread(supabase, thread.id);
      if (!cancelled) hydrateMessages(thread.id, messages);
    })();
  }, []);

  const visitorThreadId = useChatStore((s) => s.visitorThreadId);
  return { visitorThreadId };
}

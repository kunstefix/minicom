"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  joinThreadPresence,
  onThreadPresenceSync,
  leaveThreadPresence,
} from "@/lib/supabase/presence";
import { useChatStore } from "@/store/chat-store";

/**
 * Track local user presence in the active thread. Call with threadId and viewer id.
 */
export function useUserPresence(threadId: string | null, participantId: string | null) {
  const { setPresenceSnapshot } = useChatStore();

  useEffect(() => {
    if (!threadId || !participantId) return;

    const supabase = createClient();
    const channel = joinThreadPresence(supabase, threadId, participantId, "online");
    onThreadPresenceSync(channel, (state) => {
      const list = Object.values(state).flat();
      setPresenceSnapshot(threadId, list);
    });

    return () => {
      leaveThreadPresence(channel);
    };
  }, [threadId, participantId, setPresenceSnapshot]);
}

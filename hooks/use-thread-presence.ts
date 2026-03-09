"use client";

import { useChatStore } from "@/store/chat-store";
import { selectCurrentPresenceState } from "@/store/selectors";

/**
 * Read remote presence state from store for the given thread.
 */
export function useThreadPresence(threadId: string | null) {
  const presence = useChatStore((state) =>
    selectCurrentPresenceState(state, threadId)
  );
  return presence;
}

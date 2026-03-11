"use client";

import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/store/chat-store";
import { selectCurrentPresenceState } from "@/store/selectors";

/**
 * Read remote presence state from store for the given thread.
 */
export function useThreadPresence(threadId: string | null) {
  const presence = useChatStore(
    useShallow((state) => selectCurrentPresenceState(state, threadId))
  );
  return presence;
}

"use client";

import { useCallback } from "react";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/client";
import { insertMessage } from "@/lib/supabase/queries";
import { useChatStore } from "@/store/chat-store";
import type { Message } from "@/types/chat";

export function useSendMessage(threadId: string | null) {
  const {
    viewer,
    addOptimisticMessage,
    reconcileOptimisticMessage,
    markOptimisticMessageFailed,
    bumpThreadUpdatedAt,
    setThreadPreview,
  } = useChatStore();

  const send = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!threadId || !viewer) return null;
      const clientId = nanoid();
      const optimistic: Message = {
        id: "",
        threadId,
        senderId: viewer.id,
        content,
        status: "sending",
        clientId,
        createdAt: new Date().toISOString(),
      };
      addOptimisticMessage(threadId, optimistic);
      bumpThreadUpdatedAt(threadId);
      setThreadPreview(threadId, content.slice(0, 50) || null);

      const supabase = createClient();
      try {
        const serverMessage = await insertMessage(
          supabase,
          threadId,
          viewer.id,
          content,
          clientId
        );
        reconcileOptimisticMessage(threadId, clientId, serverMessage);
        return serverMessage;
      } catch {
        markOptimisticMessageFailed(threadId, clientId);
        return null;
      }
    },
    [
      threadId,
      viewer,
      addOptimisticMessage,
      reconcileOptimisticMessage,
      markOptimisticMessageFailed,
      bumpThreadUpdatedAt,
      setThreadPreview,
    ]
  );

  return { send };
}

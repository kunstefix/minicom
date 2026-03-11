"use client";

import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/store/chat-store";
import { selectMergedThreadMessages } from "@/store/selectors";
import { useChatThread } from "@/hooks/use-chat-thread";
import { useThreadPresence } from "@/hooks/use-thread-presence";
import { useSendMessage } from "@/hooks/use-send-message";
import { useTypingState } from "@/hooks/use-typing-state";
import { useTypingBroadcast } from "@/hooks/use-typing-broadcast";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { ThreadHeader } from "./thread-header";
import { ErrorFallback } from "@/components/ui/error-fallback";
import { cn } from "@/lib/utils";

const EMPTY_MESSAGES: never[] = [];
const EMPTY_TYPING: never[] = [];

export interface ThreadPanelProps {
  threadId: string | null;
  onBack?: () => void;
  className?: string;
}

export function ThreadPanel({
  threadId,
  onBack,
  className,
}: ThreadPanelProps) {
  useChatThread(threadId);

  const thread = useChatStore((s) =>
    threadId ? s.threadsById[threadId] ?? null : null
  );
  const viewer = useChatStore((s) => s.viewer);
  const connectionState = useChatStore((s) => s.connectionState);
  const participantsById = useChatStore((s) => s.participantsById);
  const messages = useChatStore(
    useShallow((s) =>
      threadId ? selectMergedThreadMessages(s, threadId) : EMPTY_MESSAGES
    )
  );
  const typingByThread = useChatStore(
    useShallow((s) =>
      threadId ? s.typingByThreadId[threadId] ?? EMPTY_TYPING : EMPTY_TYPING
    )
  );
  const showTyping = typingByThread.some(
    (p) => p.participantId !== viewer?.id
  );
  const presence = useThreadPresence(threadId);
  const visitorOnline =
    thread != null &&
    presence.some((p) => p.participantId === thread.visitorId);

  const removeOptimisticMessage = useChatStore((s) => s.removeOptimisticMessage);
  const { send } = useSendMessage(threadId);
  const { isTyping, setTyping } = useTypingState();
  useTypingBroadcast(threadId, viewer?.id ?? null, isTyping);

  const handleRetryMessage = (message: { threadId: string; clientId?: string | null; content: string }) => {
    if (!message.clientId) return;
    removeOptimisticMessage(message.threadId, message.clientId);
    send(message.content);
  };

  if (!threadId) {
    return (
      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-2 p-4 text-muted-foreground",
          className
        )}
      >
        <p>Select a conversation</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className={cn("flex flex-1 flex-col", className)}>
        <ThreadHeader title="Loading…" onBack={onBack} />
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-sm text-muted-foreground">Loading thread…</p>
        </div>
      </div>
    );
  }

  if (connectionState === "error") {
    return (
      <div className={cn("flex flex-1 flex-col", className)}>
        <ThreadHeader
          title={`Thread ${thread.visitorId.slice(0, 8)}…`}
          onBack={onBack}
        />
        <ErrorFallback
          message="Connection error. Check your network."
          onRetry={() => useChatStore.getState().setConnectionState("connecting")}
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      <ThreadHeader
        title={`Thread ${thread.visitorId.slice(0, 8)}…`}
        subtitle={visitorOnline ? "Online" : "Offline"}
        status={visitorOnline ? "online" : "offline"}
        onBack={onBack}
      />
      <MessageList
        messages={messages}
        currentUserId={viewer?.id ?? ""}
        participantsById={participantsById}
        showTyping={showTyping}
        onRetryMessage={handleRetryMessage}
        className="flex-1"
      />
      <MessageComposer
        onSend={async (content) => { await send(content); }}
        onTypingChange={setTyping}
      />
    </div>
  );
}

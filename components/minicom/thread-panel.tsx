"use client";

import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/store/chat-store";
import { selectMergedThreadMessages } from "@/store/selectors";
import { useChatThread } from "@/hooks/use-chat-thread";
import { useSendMessage } from "@/hooks/use-send-message";
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

  const { send } = useSendMessage(threadId);

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
        onBack={onBack}
      />
      <MessageList
        messages={messages}
        currentUserId={viewer?.id ?? ""}
        participantsById={participantsById}
        showTyping={showTyping}
        className="flex-1"
      />
      <MessageComposer
        onSend={async (content) => { await send(content); }}
        disabled={connectionState !== "connected"}
      />
    </div>
  );
}

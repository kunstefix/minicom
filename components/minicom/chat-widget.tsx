"use client";

import { useShallow } from "zustand/react/shallow";
import { useChatStore } from "@/store/chat-store";
import { selectMergedThreadMessages } from "@/store/selectors";
import { useVisitorThread } from "@/hooks/use-visitor-thread";
import { useChatThread } from "@/hooks/use-chat-thread";
import { useSendMessage } from "@/hooks/use-send-message";
import { useTypingState } from "@/hooks/use-typing-state";
import { useTypingBroadcast } from "@/hooks/use-typing-broadcast";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageComposer } from "./message-composer";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EMPTY_MESSAGES: never[] = [];
const EMPTY_TYPING: never[] = [];

export interface ChatWidgetProps {
  onClose?: () => void;
  className?: string;
}

export function ChatWidget({ onClose, className }: ChatWidgetProps) {
  const { visitorThreadId } = useVisitorThread();
  useChatThread(visitorThreadId);

  const viewer = useChatStore((s) => s.viewer);
  const connectionState = useChatStore((s) => s.connectionState);
  const participantsById = useChatStore((s) => s.participantsById);
  const messages = useChatStore(
    useShallow((s) =>
      visitorThreadId
        ? selectMergedThreadMessages(s, visitorThreadId)
        : EMPTY_MESSAGES
    )
  );
  const agentId = visitorThreadId
    ? useChatStore.getState().threadsById[visitorThreadId]?.agentId
    : null;
  const agent = agentId ? participantsById[agentId] : null;

  const { send } = useSendMessage(visitorThreadId);
  const { isTyping, setTyping } = useTypingState();
  useTypingBroadcast(visitorThreadId ?? null, viewer?.id ?? null, isTyping);

  const typingByThread = useChatStore(
    useShallow((s) =>
      visitorThreadId
        ? s.typingByThreadId[visitorThreadId] ?? EMPTY_TYPING
        : EMPTY_TYPING
    )
  );
  const showTyping =
    typingByThread.filter((p) => p.participantId !== viewer?.id).length > 0;

  if (!viewer) {
    return (
      <Card
        className={cn("flex h-[400px] items-center justify-center", className)}
        role="status"
        aria-label="Loading chat"
      >
        <p className="text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  return (
    <Card
      role="region"
      aria-label="Chat with support"
      className={cn(
        "flex h-[400px] min-h-[300px] max-h-[80vh] w-full max-w-[360px] flex-col overflow-hidden sm:w-[360px]",
        className
      )}
    >
      <ChatHeader
        title={agent?.displayName ?? "Support"}
        subtitle="We typically reply within a few minutes"
        status={
          connectionState === "connected" ? "online" : "offline"
        }
        onClose={onClose}
      />
      {connectionState === "disconnected" && (
        <OfflineBanner className="mx-2 mt-2" />
      )}
      <MessageList
        messages={messages}
        currentUserId={viewer.id}
        participantsById={participantsById}
        showTyping={showTyping}
        className="flex-1"
      />
      <MessageComposer
        onSend={async (content) => {
          await send(content);
          setTyping(false);
        }}
        onTypingChange={setTyping}
        disabled={connectionState !== "connected"}
      />
    </Card>
  );
}

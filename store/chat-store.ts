import { create } from "zustand";
import type {
  Participant,
  Thread,
  Message,
  InboxSortMode,
  ConnectionState,
  TypingPayload,
} from "@/types/chat";
import type { PresencePayload } from "@/lib/supabase/presence";

export interface ChatState {
  viewer: Participant | null;
  selectedThreadId: string | null;
  visitorThreadId: string | null;
  threadsById: Record<string, Thread>;
  messagesByThreadId: Record<string, Message[]>;
  participantsById: Record<string, Participant>;
  optimisticMessagesByThreadId: Record<string, Message[]>;
  presenceByThreadId: Record<string, PresencePayload[]>;
  typingByThreadId: Record<string, TypingPayload[]>;
  inboxSortMode: InboxSortMode;
  connectionState: ConnectionState;
  threadReadByKey: Record<string, { lastReadAt: string }>;
}

export interface ChatActions {
  setViewer: (viewer: Participant | null) => void;
  hydrateThreads: (threads: Thread[]) => void;
  hydrateMessages: (threadId: string, messages: Message[]) => void;
  upsertThread: (thread: Thread) => void;
  upsertThreads: (threads: Thread[]) => void;
  upsertMessage: (message: Message) => void;
  upsertMessages: (threadId: string, messages: Message[]) => void;
  addOptimisticMessage: (threadId: string, message: Message) => void;
  reconcileOptimisticMessage: (threadId: string, clientId: string, serverMessage: Message) => void;
  markOptimisticMessageFailed: (threadId: string, clientId: string) => void;
  removeOptimisticMessage: (threadId: string, clientId: string) => void;
  selectThread: (threadId: string | null) => void;
  setVisitorThreadId: (threadId: string | null) => void;
  setPresenceSnapshot: (threadId: string, presence: PresencePayload[]) => void;
  setTypingState: (threadId: string, payloads: TypingPayload[]) => void;
  setInboxSortMode: (mode: InboxSortMode) => void;
  setConnectionState: (state: ConnectionState) => void;
  markThreadReadLocal: (threadId: string, participantId: string, lastReadAt: string) => void;
}

const threadReadKey = (threadId: string, participantId: string) =>
  `${threadId}:${participantId}`;

function upsertThreadInto(
  prev: Record<string, Thread>,
  thread: Thread
): Record<string, Thread> {
  return { ...prev, [thread.id]: thread };
}

function upsertMessagesInto(
  prev: Record<string, Message[]>,
  threadId: string,
  messages: Message[],
  merge: "replace" | "append"
): Record<string, Message[]> {
  const existing = prev[threadId] ?? [];
  const next =
    merge === "replace"
      ? messages
      : [...existing, ...messages.filter((m) => !existing.some((e) => e.id === m.id))];
  return { ...prev, [threadId]: next };
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  viewer: null,
  selectedThreadId: null,
  visitorThreadId: null,
  threadsById: {},
  messagesByThreadId: {},
  participantsById: {},
  optimisticMessagesByThreadId: {},
  presenceByThreadId: {},
  typingByThreadId: {},
  inboxSortMode: "recent",
  connectionState: "disconnected",
  threadReadByKey: {},

  setViewer: (viewer) => set({ viewer }),

  hydrateThreads: (threads) =>
    set((state) => ({
      threadsById: threads.reduce(
        (acc, t) => upsertThreadInto(acc, t),
        { ...state.threadsById }
      ),
    })),

  hydrateMessages: (threadId, messages) =>
    set((state) => ({
      messagesByThreadId: upsertMessagesInto(
        { ...state.messagesByThreadId },
        threadId,
        messages,
        "replace"
      ),
    })),

  upsertThread: (thread) =>
    set((state) => ({
      threadsById: upsertThreadInto({ ...state.threadsById }, thread),
    })),

  upsertThreads: (threads) =>
    set((state) => {
      const next = { ...state.threadsById };
      threads.forEach((t) => (next[t.id] = t));
      return { threadsById: next };
    }),

  upsertMessage: (message) =>
    set((state) => ({
      messagesByThreadId: upsertMessagesInto(
        { ...state.messagesByThreadId },
        message.threadId,
        [message],
        "append"
      ),
    })),

  upsertMessages: (threadId, messages) =>
    set((state) => ({
      messagesByThreadId: upsertMessagesInto(
        { ...state.messagesByThreadId },
        threadId,
        messages,
        "replace"
      ),
    })),

  addOptimisticMessage: (threadId, message) =>
    set((state) => ({
      optimisticMessagesByThreadId: {
        ...state.optimisticMessagesByThreadId,
        [threadId]: [...(state.optimisticMessagesByThreadId[threadId] ?? []), message],
      },
    })),

  reconcileOptimisticMessage: (threadId, clientId, serverMessage) =>
    set((state) => {
      const opt = (state.optimisticMessagesByThreadId[threadId] ?? []).filter(
        (m) => m.clientId !== clientId
      );
      const nextOpt = { ...state.optimisticMessagesByThreadId, [threadId]: opt };
      const existing = state.messagesByThreadId[threadId] ?? [];
      const hasId = existing.some((m) => m.id === serverMessage.id);
      const nextMessages = hasId
        ? existing
        : [...existing, serverMessage];
      return {
        optimisticMessagesByThreadId: nextOpt,
        messagesByThreadId: { ...state.messagesByThreadId, [threadId]: nextMessages },
      };
    }),

  markOptimisticMessageFailed: (threadId, clientId) =>
    set((state) => ({
      optimisticMessagesByThreadId: {
        ...state.optimisticMessagesByThreadId,
        [threadId]: (state.optimisticMessagesByThreadId[threadId] ?? []).filter(
          (m) => m.clientId !== clientId
        ),
      },
    })),

  removeOptimisticMessage: (threadId, clientId) =>
    set((state) => ({
      optimisticMessagesByThreadId: {
        ...state.optimisticMessagesByThreadId,
        [threadId]: (state.optimisticMessagesByThreadId[threadId] ?? []).filter(
          (m) => m.clientId !== clientId
        ),
      },
    })),

  selectThread: (selectedThreadId) => set({ selectedThreadId }),

  setVisitorThreadId: (visitorThreadId) => set({ visitorThreadId }),

  setPresenceSnapshot: (threadId, presence) =>
    set((state) => ({
      presenceByThreadId: { ...state.presenceByThreadId, [threadId]: presence },
    })),

  setTypingState: (threadId, payloads) =>
    set((state) => ({
      typingByThreadId: { ...state.typingByThreadId, [threadId]: payloads },
    })),

  setInboxSortMode: (inboxSortMode) => set({ inboxSortMode }),

  setConnectionState: (connectionState) => set({ connectionState }),

  markThreadReadLocal: (threadId, participantId, lastReadAt) =>
    set((state) => ({
      threadReadByKey: {
        ...state.threadReadByKey,
        [threadReadKey(threadId, participantId)]: { lastReadAt },
      },
    })),
}));

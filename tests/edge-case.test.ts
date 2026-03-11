import { describe, it, expect } from "vitest";
import {
  selectMergedThreadMessages,
  selectUnreadCountForThread,
} from "@/store/selectors";
import type { ChatState } from "@/store/chat-store";
import type { Message } from "@/types/chat";

const baseMsg = (overrides: Partial<Message>): Message => ({
  id: "m",
  threadId: "t1",
  senderId: "u1",
  content: "",
  status: "sent",
  createdAt: new Date().toISOString(),
  ...overrides,
});

function state(overrides: Partial<ChatState>): ChatState {
  return {
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
    ...overrides,
  };
}

describe("Edge cases", () => {
  it("selectMergedThreadMessages returns empty array for thread with no messages", () => {
    const s = state({ messagesByThreadId: {}, optimisticMessagesByThreadId: {} });
    expect(selectMergedThreadMessages(s, "t1")).toEqual([]);
  });

  it("selectMergedThreadMessages dedupes optimistic when confirmed has same clientId", () => {
    const confirmed = [
      baseMsg({
        id: "m1",
        content: "Done",
        clientId: "c1",
        createdAt: "2025-01-01T12:00:00Z",
      }),
    ];
    const optimistic = [
      baseMsg({
        id: "",
        content: "Sending",
        clientId: "c1",
        status: "sending",
        createdAt: "2025-01-01T11:59:00Z",
      }),
    ];
    const s = state({
      messagesByThreadId: { t1: confirmed },
      optimisticMessagesByThreadId: { t1: optimistic },
    });
    const merged = selectMergedThreadMessages(s, "t1");
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("m1");
  });

  it("selectUnreadCountForThread returns all other participant messages when lastRead is null", () => {
    const messages = [
      baseMsg({ id: "m1", senderId: "agent", content: "Hi" }),
      baseMsg({ id: "m2", senderId: "visitor", content: "Hey" }),
      baseMsg({ id: "m3", senderId: "agent", content: "Bye" }),
    ];
    const s = state({
      messagesByThreadId: { t1: messages },
      threadReadByKey: {},
    });
    expect(selectUnreadCountForThread(s, "t1", "visitor")).toBe(2);
  });
});

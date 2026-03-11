import { describe, it, expect, beforeEach } from "vitest";
import { useChatStore } from "@/store/chat-store";
import type { Thread, Message } from "@/types/chat";

describe("Chat store state transitions", () => {
  beforeEach(() => {
    useChatStore.setState({
      threadsById: {},
      messagesByThreadId: {},
      participantsById: {},
      optimisticMessagesByThreadId: {},
    });
  });

  it("upsertThread adds thread to threadsById", () => {
    const thread: Thread = {
      id: "t1",
      agentId: "a1",
      visitorId: "v1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    useChatStore.getState().upsertThread(thread);
    expect(useChatStore.getState().threadsById["t1"]).toEqual({ ...thread, preview: null });
  });

  it("upsertMessage appends message to thread", () => {
    const msg: Message = {
      id: "m1",
      threadId: "t1",
      senderId: "v1",
      content: "Hi",
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    useChatStore.getState().upsertMessage(msg);
    expect(useChatStore.getState().messagesByThreadId["t1"]).toHaveLength(1);
    expect(useChatStore.getState().messagesByThreadId["t1"][0].content).toBe("Hi");
  });

  it("upsertMessage creates messages array for new thread (first message)", () => {
    const msg: Message = {
      id: "m1",
      threadId: "t-new",
      senderId: "v1",
      content: "First",
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    expect(useChatStore.getState().messagesByThreadId["t-new"]).toBeUndefined();
    useChatStore.getState().upsertMessage(msg);
    expect(useChatStore.getState().messagesByThreadId["t-new"]).toHaveLength(1);
    expect(useChatStore.getState().messagesByThreadId["t-new"][0].content).toBe("First");
  });

  it("addOptimisticMessage and reconcileOptimisticMessage replace by clientId", () => {
    const opt: Message = {
      id: "",
      threadId: "t1",
      senderId: "v1",
      content: "Sending",
      status: "sending",
      clientId: "c1",
      createdAt: new Date().toISOString(),
    };
    useChatStore.getState().addOptimisticMessage("t1", opt);
    const server: Message = {
      id: "m1",
      threadId: "t1",
      senderId: "v1",
      content: "Sending",
      status: "sent",
      clientId: "c1",
      createdAt: new Date().toISOString(),
    };
    useChatStore.getState().reconcileOptimisticMessage("t1", "c1", server);
    const messages = useChatStore.getState().messagesByThreadId["t1"] ?? [];
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe("m1");
    expect(useChatStore.getState().optimisticMessagesByThreadId["t1"] ?? []).toHaveLength(0);
  });
});

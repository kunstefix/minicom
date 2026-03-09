import { describe, it, expect } from "vitest";
import { mergeOptimisticAndConfirmed, replaceByClientId } from "@/lib/chat/reconcile-messages";
import type { Message } from "@/types/chat";

const baseMsg = (
  overrides: Partial<Message>
): Message => ({
  id: "m",
  threadId: "t1",
  senderId: "u1",
  content: "",
  status: "sent",
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("Out of order messages / reconciliation", () => {
  it("mergeOptimisticAndConfirmed prefers confirmed over optimistic with same clientId", () => {
    const confirmed = [
      baseMsg({ id: "m1", content: "Done", clientId: "c1", createdAt: "2025-01-01T12:00:00Z" }),
    ];
    const optimistic = [
      baseMsg({ id: "", content: "Sending", clientId: "c1", status: "sending", createdAt: "2025-01-01T11:59:00Z" }),
    ];
    const merged = mergeOptimisticAndConfirmed(confirmed, optimistic);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("m1");
  });

  it("replaceByClientId replaces optimistic by clientId with server message", () => {
    const messages = [
      baseMsg({ id: "", content: "Sending", clientId: "c1", status: "sending" }),
      baseMsg({ id: "m2", content: "Other", createdAt: "2025-01-01T12:01:00Z" }),
    ];
    const server = baseMsg({ id: "m1", content: "Sending", clientId: "c1", status: "sent" });
    const result = replaceByClientId(messages, "c1", server);
    expect(result).toHaveLength(2);
    const first = result.find((m) => m.clientId === "c1" || m.id === "m1");
    expect(first?.id).toBe("m1");
  });
});

import { describe, it, expect } from "vitest";
import { mergeOptimisticAndConfirmed } from "@/lib/chat/reconcile-messages";
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

  it("mergeOptimisticAndConfirmed returns messages sorted by createdAt", () => {
    const confirmed = [
      baseMsg({ id: "m2", content: "Second", createdAt: "2025-01-01T12:01:00Z" }),
      baseMsg({ id: "m1", content: "First", createdAt: "2025-01-01T12:00:00Z" }),
    ];
    const optimistic: Message[] = [];
    const merged = mergeOptimisticAndConfirmed(confirmed, optimistic);
    expect(merged).toHaveLength(2);
    expect(merged[0].createdAt).toBe("2025-01-01T12:00:00Z");
    expect(merged[1].createdAt).toBe("2025-01-01T12:01:00Z");
  });
});

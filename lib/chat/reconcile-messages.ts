import type { Message } from "@/types/chat";

/**
 * Merge optimistic and confirmed messages by clientId; avoid duplicates (prefer confirmed).
 */
export function mergeOptimisticAndConfirmed(
  confirmed: Message[],
  optimistic: Message[]
): Message[] {
  const byClientId = new Map<string, Message>();
  for (const m of confirmed) {
    if (m.clientId) byClientId.set(m.clientId, m);
  }
  for (const m of optimistic) {
    if (m.clientId && !byClientId.has(m.clientId)) byClientId.set(m.clientId, m);
  }
  const confirmedIds = new Set(confirmed.map((m) => m.id));
  const merged: Message[] = [...confirmed];
  for (const opt of optimistic) {
    if (opt.clientId && byClientId.get(opt.clientId)?.id === opt.id) continue;
    if (opt.clientId && !confirmedIds.has(opt.id)) {
      const existing = byClientId.get(opt.clientId);
      if (!existing) merged.push(opt);
    }
  }
  return merged.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Match optimistic message by clientId and replace with server message.
 */
export function replaceByClientId(
  messages: Message[],
  clientId: string,
  serverMessage: Message
): Message[] {
  const out: Message[] = [];
  let replaced = false;
  for (const m of messages) {
    if (m.clientId === clientId && !replaced) {
      out.push(serverMessage);
      replaced = true;
    } else if (m.id !== serverMessage.id) {
      out.push(m);
    }
  }
  if (!replaced) out.push(serverMessage);
  return out.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

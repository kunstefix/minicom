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

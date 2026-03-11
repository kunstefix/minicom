import type { RealtimeChannel } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface PresencePayload {
  participantId: string;
  status?: string;
  updatedAt?: string;
}

const CHANNEL_PREFIX = "thread:";
const CHANNEL_SUFFIX = ":presence";
const HEARTBEAT_MS = 15_000;

function toPayload(p: unknown): PresencePayload | null {
  if (p == null || typeof p !== "object") return null;
  const o = p as Record<string, unknown>;
  if (typeof o.participantId !== "string") return null;
  return {
    participantId: o.participantId,
    status: typeof o.status === "string" ? o.status : undefined,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

function stateToList(state: Record<string, unknown[]>): PresencePayload[] {
  const list: PresencePayload[] = [];
  for (const payloads of Object.values(state)) {
    for (const p of payloads ?? []) {
      const payload = toPayload(p);
      if (payload) list.push(payload);
    }
  }
  return list;
}

/** Presence channel name for a thread. Must match on agent and client. */
export function threadPresenceChannelName(threadId: string): string {
  return `${CHANNEL_PREFIX}${threadId}${CHANNEL_SUFFIX}`;
}

/**
 * Subscribe to a thread's presence and push real-time presence list to the store.
 * Uses join/leave event payloads for immediate updates (no reliance on presenceState() timing).
 * Sync event replaces with full state. Light heartbeat keeps presence alive.
 * Returns cleanup (call on unmount).
 */
export function subscribeToThreadPresence(
  supabase: SupabaseClient,
  threadId: string,
  participantId: string,
  onPresence: (list: PresencePayload[]) => void
): () => void {
  const channelName = threadPresenceChannelName(threadId);
  const channel = supabase.channel(channelName, {
    config: { presence: { key: participantId } },
  });

  let currentList: PresencePayload[] = [];
  let heartbeatId: ReturnType<typeof setInterval> | null = null;

  const emit = () => onPresence([...currentList]);

  const handleSync = () => {
    const state = channel.presenceState() as Record<string, unknown[]>;
    currentList = stateToList(state);
    emit();
  };

  const handleJoin = (payload: { key?: string; newPresences?: unknown[] }) => {
    const joined = (payload.newPresences ?? [])
      .map(toPayload)
      .filter((p): p is PresencePayload => p !== null);
    const keys = new Set(joined.map((p) => p.participantId));
    currentList = currentList.filter((p) => !keys.has(p.participantId));
    currentList.push(...joined);
    emit();
  };

  const handleLeave = (payload: { key?: string; leftPresences?: unknown[] }) => {
    const left = (payload.leftPresences ?? [])
      .map(toPayload)
      .filter((p): p is PresencePayload => p !== null);
    const keys = new Set(left.map((p) => p.participantId));
    currentList = currentList.filter((p) => !keys.has(p.participantId));
    emit();
  };

  channel
    .on("presence", { event: "sync" }, handleSync)
    .on("presence", { event: "join" }, handleJoin)
    .on("presence", { event: "leave" }, handleLeave)
    .subscribe(async (status) => {
      if (status !== "SUBSCRIBED") return;
      await channel.track({
        participantId,
        status: "online",
        updatedAt: new Date().toISOString(),
      });
      handleSync();

      heartbeatId = setInterval(async () => {
        await channel.track({
          participantId,
          status: "online",
          updatedAt: new Date().toISOString(),
        });
      }, HEARTBEAT_MS);
    });

  return () => {
    if (heartbeatId != null) clearInterval(heartbeatId);
    channel.unsubscribe();
  };
}

export function getPresenceListFromChannel(channel: RealtimeChannel): PresencePayload[] {
  const state = channel.presenceState() as Record<string, unknown[]>;
  return stateToList(state);
}

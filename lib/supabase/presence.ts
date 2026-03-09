import type { RealtimeChannel } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface PresencePayload {
  participantId: string;
  status?: string;
  updatedAt?: string;
}

export function joinThreadPresence(
  supabase: SupabaseClient,
  threadId: string,
  participantId: string,
  status = "online"
): RealtimeChannel {
  const channel = supabase.channel(`thread:${threadId}:presence`, {
    config: { presence: { key: participantId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      // Sync state from server
    })
    .subscribe(async (subStatus) => {
      if (subStatus === "SUBSCRIBED") {
        await channel.track({
          participantId,
          status,
          updatedAt: new Date().toISOString(),
        });
      }
    });

  return channel;
}

export function onThreadPresenceSync(
  channel: RealtimeChannel,
  callback: (presence: Record<string, PresencePayload[]>) => void
): void {
  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();
    const mapped: Record<string, PresencePayload[]> = {};
    for (const [key, payloads] of Object.entries(state)) {
      mapped[key] = (payloads as unknown[]).filter(
        (p): p is PresencePayload =>
          p != null &&
          typeof (p as PresencePayload).participantId === "string"
      );
    }
    callback(mapped);
  });
}

export async function leaveThreadPresence(
  channel: RealtimeChannel
): Promise<void> {
  await channel.unsubscribe();
}

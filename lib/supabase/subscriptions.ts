import type { RealtimeChannel } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message } from "@/types/chat";
import { mapMessageRowToMessage } from "./mappers";

/** Realtime subscribe status: SUBSCRIBED | CLOSED | CHANNEL_ERROR | TIMED_OUT */
export type RealtimeSubscribeStatus = string;

export function subscribeToThreadMessages(
  supabase: SupabaseClient,
  threadId: string,
  onInsert: (message: Message) => void,
  onStatus?: (status: RealtimeSubscribeStatus) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`thread:${threadId}:messages`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `thread_id=eq.${threadId}`,
      },
      (payload) => {
        const row = payload.new as Parameters<typeof mapMessageRowToMessage>[0];
        onInsert(mapMessageRowToMessage(row));
      }
    )
    .subscribe((status) => {
      onStatus?.(status);
    });

  return channel;
}

export function subscribeToThreadUpdates(
  supabase: SupabaseClient,
  threadId: string,
  onUpdate: () => void
): RealtimeChannel {
  const channel = supabase
    .channel(`thread:${threadId}:updates`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "threads",
        filter: `id=eq.${threadId}`,
      },
      () => onUpdate()
    )
    .subscribe();

  return channel;
}

export function subscribeToInboxUpdates(
  supabase: SupabaseClient,
  agentId: string,
  onUpdate: () => void,
  onMessageInsert?: (message: Message) => void,
  onStatus?: (status: RealtimeSubscribeStatus) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`inbox:${agentId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "threads",
        filter: `agent_id=eq.${agentId}`,
      },
      () => onUpdate()
    )
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        if (onMessageInsert && payload.new) {
          const row = payload.new as Parameters<typeof mapMessageRowToMessage>[0];
          onMessageInsert(mapMessageRowToMessage(row));
        }
        onUpdate();
      }
    )
    .subscribe((status) => {
      onStatus?.(status);
    });

  return channel;
}

export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await channel.unsubscribe();
}

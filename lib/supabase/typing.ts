import type { RealtimeChannel } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TypingPayload } from "@/types/chat";

const TYPING_EVENT = "typing";

export function sendTypingStart(
  channel: RealtimeChannel,
  threadId: string,
  participantId: string
): void {
  channel.send({
    type: "broadcast",
    event: TYPING_EVENT,
    payload: { threadId, participantId, isTyping: true },
  });
}

export function sendTypingStop(
  channel: RealtimeChannel,
  threadId: string,
  participantId: string
): void {
  channel.send({
    type: "broadcast",
    event: TYPING_EVENT,
    payload: { threadId, participantId, isTyping: false },
  });
}

export function subscribeToTyping(
  supabase: SupabaseClient,
  threadId: string,
  onTyping: (payload: TypingPayload) => void
): RealtimeChannel {
  const channel = supabase.channel(`thread:${threadId}:typing`);
  channel.on("broadcast", { event: TYPING_EVENT }, ({ payload }) => {
    if (
      payload &&
      typeof payload.threadId === "string" &&
      typeof payload.participantId === "string" &&
      typeof payload.isTyping === "boolean"
    ) {
      onTyping({
        threadId: payload.threadId,
        participantId: payload.participantId,
        isTyping: payload.isTyping,
      });
    }
  });
  channel.subscribe();
  return channel;
}

export async function unsubscribeTyping(channel: RealtimeChannel): Promise<void> {
  await channel.unsubscribe();
}

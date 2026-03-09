import type { SupabaseClient } from "@supabase/supabase-js";
import type { Participant, Thread, Message, ThreadReadState } from "@/types/chat";
import {
  mapProfileRowToParticipant,
  mapThreadRowToThread,
  mapMessageRowToMessage,
  mapThreadReadRowToReadState,
} from "./mappers";

export async function ensureVisitorProfile(
  supabase: SupabaseClient,
  visitorId: string,
  displayName?: string | null
): Promise<Participant> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", visitorId)
    .single();

  if (existing) {
    return mapProfileRowToParticipant(existing as Parameters<typeof mapProfileRowToParticipant>[0]);
  }

  const { data: inserted, error } = await supabase
    .from("profiles")
    .insert({
      id: visitorId,
      role: "visitor",
      display_name: displayName ?? null,
      avatar_url: null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapProfileRowToParticipant(inserted as Parameters<typeof mapProfileRowToParticipant>[0]);
}

export async function getAgentProfile(
  supabase: SupabaseClient,
  agentId: string
): Promise<Participant | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", agentId)
    .eq("role", "agent")
    .single();

  if (error || !data) return null;
  return mapProfileRowToParticipant(data as Parameters<typeof mapProfileRowToParticipant>[0]);
}

export async function getThreadsForAgent(
  supabase: SupabaseClient,
  agentId: string
): Promise<Thread[]> {
  const { data, error } = await supabase
    .from("threads")
    .select("*")
    .eq("agent_id", agentId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapThreadRowToThread(row as Parameters<typeof mapThreadRowToThread>[0]));
}

export async function getThreadById(
  supabase: SupabaseClient,
  threadId: string
): Promise<Thread | null> {
  const { data, error } = await supabase
    .from("threads")
    .select("*")
    .eq("id", threadId)
    .single();

  if (error || !data) return null;
  return mapThreadRowToThread(data as Parameters<typeof mapThreadRowToThread>[0]);
}

export async function getMessagesForThread(
  supabase: SupabaseClient,
  threadId: string,
  limit = 100
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => mapMessageRowToMessage(row as Parameters<typeof mapMessageRowToMessage>[0]));
}

export async function createThread(
  supabase: SupabaseClient,
  agentId: string,
  visitorId: string
): Promise<Thread> {
  const { data, error } = await supabase
    .from("threads")
    .insert({ agent_id: agentId, visitor_id: visitorId })
    .select()
    .single();

  if (error) throw error;
  return mapThreadRowToThread(data as Parameters<typeof mapThreadRowToThread>[0]);
}

export async function insertMessage(
  supabase: SupabaseClient,
  threadId: string,
  senderId: string,
  content: string,
  clientId?: string | null
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      sender_id: senderId,
      content,
      status: "sent",
      client_id: clientId ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapMessageRowToMessage(data as Parameters<typeof mapMessageRowToMessage>[0]);
}

export async function markThreadRead(
  supabase: SupabaseClient,
  threadId: string,
  participantId: string
): Promise<void> {
  await supabase.from("thread_reads").upsert(
    {
      thread_id: threadId,
      participant_id: participantId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "thread_id,participant_id" }
  );
}

export async function getThreadReadState(
  supabase: SupabaseClient,
  threadId: string,
  participantId: string
): Promise<ThreadReadState | null> {
  const { data, error } = await supabase
    .from("thread_reads")
    .select("*")
    .eq("thread_id", threadId)
    .eq("participant_id", participantId)
    .single();

  if (error || !data) return null;
  return mapThreadReadRowToReadState(data as Parameters<typeof mapThreadReadRowToReadState>[0]);
}

export async function assignAgentIfNeeded(
  supabase: SupabaseClient,
  _threadId: string
): Promise<string | null> {
  // Placeholder: in a multi-agent setup, assign an agent. For demo, return null (thread already has agent_id).
  return null;
}

export async function updateThreadSummary(
  supabase: SupabaseClient,
  threadId: string,
  summary: string
): Promise<void> {
  await supabase
    .from("threads")
    .update({ summary, updated_at: new Date().toISOString() })
    .eq("id", threadId);
}

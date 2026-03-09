/**
 * MiniCom Supabase row types (profiles, threads, messages, thread_reads).
 */

export interface ProfileRow {
  id: string;
  role: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThreadRow {
  id: string;
  agent_id: string;
  visitor_id: string;
  summary: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  status: string;
  client_id: string | null;
  created_at: string;
}

export interface ThreadReadRow {
  thread_id: string;
  participant_id: string;
  last_read_at: string;
}

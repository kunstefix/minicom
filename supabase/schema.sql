-- MiniCom: profiles, threads, messages, thread_reads
-- Run in Supabase SQL editor or via migration.

-- Profiles (participants: agent + visitor). id is text to allow nanoid for visitors.
create table if not exists public.profiles (
  id text primary key,
  role text not null default 'visitor' check (role in ('agent', 'visitor')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Threads (one per visitor–agent conversation)
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null references public.profiles(id) on delete cascade,
  visitor_id text not null references public.profiles(id) on delete cascade,
  summary text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_threads_agent_id on public.threads(agent_id);
create index if not exists idx_threads_visitor_id on public.threads(visitor_id);
create index if not exists idx_threads_updated_at on public.threads(updated_at desc);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id text not null references public.profiles(id) on delete cascade,
  content text not null,
  status text not null default 'sent' check (status in ('sending', 'sent', 'delivered', 'failed')),
  client_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_thread_id on public.messages(thread_id);
create index if not exists idx_messages_created_at on public.messages(thread_id, created_at);

-- Thread read state (per participant per thread)
create table if not exists public.thread_reads (
  thread_id uuid not null references public.threads(id) on delete cascade,
  participant_id text not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (thread_id, participant_id)
);

create index if not exists idx_thread_reads_participant on public.thread_reads(participant_id);

-- Optional: updated_at trigger for profiles/threads
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists threads_updated_at on public.threads;
create trigger threads_updated_at
  before update on public.threads
  for each row execute function public.set_updated_at();

-- Realtime: required for live message and thread updates (Supabase hosted)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.threads;

-- RLS: starter policies (allow anon for demo; tighten for production)
alter table public.profiles enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.thread_reads enable row level security;

create policy "Allow read profiles" on public.profiles for select using (true);
create policy "Allow insert profiles" on public.profiles for insert with check (true);
create policy "Allow update profiles" on public.profiles for update using (true);

create policy "Allow all threads" on public.threads for all using (true) with check (true);
create policy "Allow all messages" on public.messages for all using (true) with check (true);
create policy "Allow all thread_reads" on public.thread_reads for all using (true) with check (true);

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
  status text not null default 'sent' check (status in ('sending', 'sent', 'failed')),
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

-- When a message is inserted, update the parent thread's updated_at
create or replace function public.bump_thread_updated_at_on_message()
returns trigger as $$
begin
  update public.threads set updated_at = now() where id = new.thread_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists messages_bump_thread_updated_at on public.messages;
create trigger messages_bump_thread_updated_at
  after insert on public.messages
  for each row execute function public.bump_thread_updated_at_on_message();

-- Single-query threads with latest message preview (avoids N+1)
drop function if exists public.get_threads_for_agent_with_preview(text);

create or replace view public.threads_with_preview as
  select
    t.id, t.agent_id, t.visitor_id, t.summary, t.status, t.created_at, t.updated_at,
    left(lm.content, 50) as preview
  from public.threads t
  left join lateral (
    select m.content from public.messages m
    where m.thread_id = t.id
    order by m.created_at desc
    limit 1
  ) lm on true;

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

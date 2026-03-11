-- One thread per (agent, visitor). Enables upsert so new tabs reuse the same thread.
alter table public.threads
  add constraint threads_agent_visitor_unique unique (agent_id, visitor_id);

-- Single-query threads with latest message preview (avoids N+1). Query this view
-- and filter by agent_id in the client.
drop function if exists public.get_threads_for_agent_with_preview(text);

create or replace view public.threads_with_preview as
  select
    t.id,
    t.agent_id,
    t.visitor_id,
    t.summary,
    t.status,
    t.created_at,
    t.updated_at,
    left(lm.content, 50) as preview
  from public.threads t
  left join lateral (
    select m.content
    from public.messages m
    where m.thread_id = t.id
    order by m.created_at desc
    limit 1
  ) lm on true;

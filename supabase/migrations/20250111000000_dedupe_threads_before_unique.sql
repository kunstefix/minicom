-- Remove duplicate threads (same agent_id, visitor_id) so we can add unique constraint.
-- Keeps the thread with the latest updated_at per (agent_id, visitor_id); deletes the rest.
-- Messages and thread_reads for deleted threads are removed by ON DELETE CASCADE.

delete from public.threads t
using (
  select id,
    row_number() over (
      partition by agent_id, visitor_id
      order by updated_at desc nulls last, id
    ) as rn
  from public.threads
) ranked
where t.id = ranked.id
  and ranked.rn > 1;

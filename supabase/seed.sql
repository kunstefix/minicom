-- MiniCom: seed demo agent. Run after schema.sql.
-- Uses a known agent id so get-default-agent can find it.

insert into public.profiles (id, role, display_name, avatar_url)
values (
  'demo-agent',
  'agent',
  'Support Agent',
  null
)
on conflict (id) do update set
  role = excluded.role,
  display_name = excluded.display_name,
  updated_at = now();

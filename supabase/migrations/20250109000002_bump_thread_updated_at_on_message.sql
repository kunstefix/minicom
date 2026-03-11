-- When a message is inserted, update the parent thread's updated_at so the thread
-- moves to the top of "recent" lists and realtime subscribers get the new order.
create or replace function public.bump_thread_updated_at_on_message()
returns trigger as $$
begin
  update public.threads
  set updated_at = now()
  where id = new.thread_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists messages_bump_thread_updated_at on public.messages;
create trigger messages_bump_thread_updated_at
  after insert on public.messages
  for each row execute function public.bump_thread_updated_at_on_message();

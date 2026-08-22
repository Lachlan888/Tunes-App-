-- Beta reset: the broad Tunes digest replaces the old notification-only digest.
alter table public.notification_preferences
  add column if not exists digest_include_practice boolean not null default true,
  add column if not exists digest_include_friends boolean not null default true,
  add column if not exists digest_include_community boolean not null default true,
  add column if not exists digest_include_updates boolean not null default true,
  add column if not exists last_digest_sent_at timestamptz null;

alter table public.notification_preferences
  alter column email_enabled set default true,
  alter column digest_frequency set default 'weekly',
  alter column email_comment_replies set default true,
  alter column email_activity_replies set default true,
  alter column email_badges set default true;

insert into public.notification_preferences (
  user_id, email_enabled, digest_frequency, email_comment_replies,
  email_activity_replies, email_badges, digest_include_practice,
  digest_include_friends, digest_include_community, digest_include_updates
)
select id, true, 'weekly', true, true, true, true, true, true, true
from auth.users
on conflict (user_id) do update set
  email_enabled = true,
  digest_frequency = 'weekly',
  email_comment_replies = true,
  email_activity_replies = true,
  email_badges = true,
  digest_include_practice = true,
  digest_include_friends = true,
  digest_include_community = true,
  digest_include_updates = true,
  last_digest_sent_at = null,
  updated_at = now();

create or replace function public.ensure_default_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists ensure_default_notification_preferences_on_signup on auth.users;
create trigger ensure_default_notification_preferences_on_signup
  after insert on auth.users
  for each row execute function public.ensure_default_notification_preferences();

create index if not exists notification_preferences_digest_due_idx
  on public.notification_preferences (digest_frequency, last_digest_sent_at)
  where email_enabled = true and digest_frequency in ('daily', 'weekly');

do $$
declare
  constraint_name text;
  constraint_expression text;
begin
  select c.conname, pg_get_expr(c.conbin, c.conrelid)
    into constraint_name, constraint_expression
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  where t.relname = 'email_delivery_log'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%notification_type%'
  limit 1;

  if constraint_name is not null and not exists (
    select 1 from pg_constraint c
    where c.conname = constraint_name
      and pg_get_constraintdef(c.oid) like '%notification_digest%'
  ) then
    execute format('alter table public.email_delivery_log drop constraint %I', constraint_name);
    execute format(
      'alter table public.email_delivery_log add constraint %I check ((%s) or notification_type = %L)',
      constraint_name,
      constraint_expression,
      'notification_digest'
    );
  end if;
end $$;

create table if not exists public.admin_email_broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id uuid not null references auth.users(id),
  audience text not null check (audience in ('all_users', 'digest_subscribers')),
  subject text not null,
  heading text null,
  message text not null,
  cta_label text null,
  cta_url text null,
  recipient_count integer not null default 0 check (recipient_count >= 0),
  sent_count integer not null default 0 check (sent_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  skipped_count integer not null default 0 check (skipped_count >= 0),
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

create index if not exists admin_email_broadcasts_created_at_idx
  on public.admin_email_broadcasts (created_at desc);

alter table public.admin_email_broadcasts enable row level security;

revoke all on table public.admin_email_broadcasts from anon, authenticated;

alter table public.email_delivery_log
  add column if not exists subject text null,
  add column if not exists admin_broadcast_id uuid null
    references public.admin_email_broadcasts(id) on delete set null;

create index if not exists email_delivery_log_admin_broadcast_id_idx
  on public.email_delivery_log (admin_broadcast_id)
  where admin_broadcast_id is not null;

do $$
declare
  constraint_name text;
  constraint_expression text;
begin
  select c.conname, pg_get_expr(c.conbin, c.conrelid)
    into constraint_name, constraint_expression
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'email_delivery_log'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) like '%notification_type%'
  limit 1;

  if constraint_name is not null and not exists (
    select 1
    from pg_constraint c
    where c.conname = constraint_name
      and c.conrelid = 'public.email_delivery_log'::regclass
      and pg_get_constraintdef(c.oid) like '%product_update%'
  ) then
    execute format(
      'alter table public.email_delivery_log drop constraint %I',
      constraint_name
    );
    execute format(
      'alter table public.email_delivery_log add constraint %I check ((%s) or notification_type = %L)',
      constraint_name,
      constraint_expression,
      'product_update'
    );
  end if;
end $$;

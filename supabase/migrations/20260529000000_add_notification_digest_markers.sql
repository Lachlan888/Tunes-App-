alter table public.user_notifications
  add column if not exists digest_email_sent_at timestamptz null,
  add column if not exists digest_email_log_id bigint null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_notifications_digest_email_log_id_fkey'
  ) then
    alter table public.user_notifications
      add constraint user_notifications_digest_email_log_id_fkey
      foreign key (digest_email_log_id)
      references public.email_delivery_log(id)
      on delete set null;
  end if;
end $$;

create index if not exists user_notifications_digest_pending_idx
  on public.user_notifications (recipient_user_id, created_at)
  where digest_email_sent_at is null
    and notification_type in ('comment_reply', 'activity_reply', 'badge_awarded');

alter table public.notification_preferences
  alter column email_comment_replies set default false,
  alter column email_activity_replies set default false,
  alter column email_badges set default false;

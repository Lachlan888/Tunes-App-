create or replace function public.get_my_repertoire_summary()
returns table (
  known_count bigint,
  practice_count bigint,
  due_today_count bigint,
  needs_attention_count bigint,
  list_count bigint,
  instrument_count bigint,
  review_event_count bigint
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := ((now() at time zone 'Australia/Melbourne')::date);
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  return query
  select
    (select count(*) from public.user_known_pieces as ukp where ukp.user_id = v_user_id),
    (select count(*) from public.user_pieces as up where up.user_id = v_user_id and up.status = 'learning'),
    (
      select count(*)
      from public.user_pieces as up
      where up.user_id = v_user_id
        and up.status = 'learning'
        and up.next_review_due = v_today
    ),
    (
      select count(*)
      from public.user_pieces as up
      where up.user_id = v_user_id
        and up.status = 'learning'
        and up.next_review_due < v_today
    ),
    (select count(*) from public.learning_lists as ll where ll.user_id = v_user_id),
    (select count(*) from public.user_instruments as ui where ui.user_id = v_user_id),
    (select count(*) from public.review_events as re where re.user_id = v_user_id);
end;
$$;

revoke execute on function public.get_my_repertoire_summary() from public;
revoke execute on function public.get_my_repertoire_summary() from anon;
grant execute on function public.get_my_repertoire_summary() to authenticated;

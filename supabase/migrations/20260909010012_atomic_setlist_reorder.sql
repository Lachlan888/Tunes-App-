create or replace function public.reorder_setlist_items(
  p_setlist_id bigint,
  p_ordered_item_ids bigint[],
  p_expected_updated_at timestamptz
)
returns table(status text, new_updated_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_current_updated_at timestamptz;
  v_item_count integer;
  v_distinct_count integer;
  v_now timestamptz := clock_timestamp();
begin
  if (select auth.uid()) is null then
    return query select 'forbidden'::text, null::timestamptz;
    return;
  end if;

  select s.updated_at
  into v_current_updated_at
  from public.setlists s
  where s.id = p_setlist_id
  for update;

  if not found then
    return query select 'not_found'::text, null::timestamptz;
    return;
  end if;

  if not exists (
    select 1
    from public.setlist_members sm
    where sm.setlist_id = p_setlist_id
      and sm.user_id = (select auth.uid())
      and sm.status = 'accepted'
  ) then
    return query select 'forbidden'::text, v_current_updated_at;
    return;
  end if;

  if p_expected_updated_at is null
     or v_current_updated_at is distinct from p_expected_updated_at then
    return query select 'conflict'::text, v_current_updated_at;
    return;
  end if;

  select count(*)
  into v_item_count
  from public.setlist_items si
  where si.setlist_id = p_setlist_id;

  select count(distinct item_id)
  into v_distinct_count
  from unnest(coalesce(p_ordered_item_ids, array[]::bigint[])) as item_id;

  if cardinality(coalesce(p_ordered_item_ids, array[]::bigint[])) <> v_item_count
     or v_distinct_count <> v_item_count
     or exists (
       select 1
       from unnest(coalesce(p_ordered_item_ids, array[]::bigint[])) as item_id
       where not exists (
         select 1
         from public.setlist_items si
         where si.setlist_id = p_setlist_id
           and si.id = item_id
       )
     ) then
    return query select 'conflict'::text, v_current_updated_at;
    return;
  end if;

  update public.setlist_items si
  set position = proposed.position,
      updated_at = v_now
  from (
    select item_id, ordinality::integer as position
    from unnest(p_ordered_item_ids) with ordinality as ordered(item_id, ordinality)
  ) proposed
  where si.setlist_id = p_setlist_id
    and si.id = proposed.item_id;

  update public.setlists
  set updated_at = v_now
  where id = p_setlist_id;

  return query select 'success'::text, v_now;
end;
$$;

revoke all on function public.reorder_setlist_items(bigint, bigint[], timestamptz) from public, anon;
grant execute on function public.reorder_setlist_items(bigint, bigint[], timestamptz) to authenticated;

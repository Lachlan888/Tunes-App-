create function public.reorder_setlist_items(
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
  v_now timestamptz;
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

  v_now := clock_timestamp();

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

-- All item actions acquire the parent first, in the same order as reorder.
-- This makes append positions and revision checks atomic without changing RLS.
create function public.mutate_setlist_item(
  p_setlist_id bigint,
  p_operation text,
  p_piece_id bigint default null,
  p_item_id bigint default null,
  p_expected_updated_at timestamptz default null,
  p_details jsonb default '{}'::jsonb
)
returns table(status text, item_id bigint, piece_id bigint)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item public.setlist_items%rowtype;
  v_now timestamptz;
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.setlist_members sm
    where sm.setlist_id = p_setlist_id and sm.user_id = (select auth.uid())
      and sm.status = 'accepted'
  ) then
    return query select 'forbidden'::text, null::bigint, null::bigint;
    return;
  end if;

  perform 1 from public.setlists s where s.id = p_setlist_id for update;
  if not found then
    return query select 'not_found'::text, null::bigint, null::bigint;
    return;
  end if;
  v_now := clock_timestamp();

  if p_operation = 'add' then
    if exists (select 1 from public.setlist_items si
      where si.setlist_id = p_setlist_id and si.piece_id = p_piece_id) then
      return query select 'duplicate'::text, null::bigint, p_piece_id;
      return;
    end if;
    if (select count(*) from public.setlist_items si where si.setlist_id = p_setlist_id) >= 200 then
      return query select 'limit'::text, null::bigint, p_piece_id;
      return;
    end if;
    insert into public.setlist_items (setlist_id, piece_id, position, added_by, updated_at)
    select p_setlist_id, p_piece_id, coalesce(max(si.position), 0) + 1, (select auth.uid()), v_now
    from public.setlist_items si where si.setlist_id = p_setlist_id
    returning * into v_item;
  elsif p_operation in ('edit', 'remove') then
    select * into v_item from public.setlist_items si
    where si.setlist_id = p_setlist_id and si.id = p_item_id;
    if not found then
      return query select 'not_found'::text, null::bigint, null::bigint;
      return;
    end if;
    if p_operation = 'edit' then
      if coalesce(v_item.updated_at, v_item.created_at) is distinct from p_expected_updated_at then
        return query select 'conflict'::text, v_item.id, v_item.piece_id;
        return;
      end if;
      update public.setlist_items si set
        performance_key = p_details->>'performance_key', notes = p_details->>'notes',
        chart_url = p_details->>'chart_url', chart_label = p_details->>'chart_label',
        chart_type = p_details->>'chart_type', updated_at = v_now
      where si.id = v_item.id and si.setlist_id = p_setlist_id;
    else
      delete from public.setlist_items si where si.id = v_item.id and si.setlist_id = p_setlist_id;
    end if;
  else
    return query select 'invalid'::text, null::bigint, null::bigint;
    return;
  end if;

  update public.setlists set updated_at = v_now where id = p_setlist_id;
  return query select 'success'::text, v_item.id, v_item.piece_id;
end;
$$;

revoke all on function public.mutate_setlist_item(bigint, text, bigint, bigint, timestamptz, jsonb) from public, anon;
grant execute on function public.mutate_setlist_item(bigint, text, bigint, bigint, timestamptz, jsonb) to authenticated;

-- Reversal: drop these two functions after reverting their callers. No data,
-- policies, tables or indexes are removed or rewritten by this migration.

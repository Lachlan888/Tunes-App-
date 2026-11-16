-- Serialize every cross-table change that can affect private festival
-- repertoire. The same ordered advisory keys are held for a hub, a list and
-- their association, so concurrent lifecycle and visibility transitions
-- cannot each validate a stale view and leave released private material.
create or replace function public.validate_festival_collection_list_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  festival_lifecycle text;
  list_visibility text;
  lock_key bigint;
begin
  for lock_key in
    select distinct lock_id
    from unnest(array[new.festival_id, new.learning_list_id]) as locks(lock_id)
    order by lock_id
  loop
    perform pg_catalog.pg_advisory_xact_lock(lock_key);
  end loop;

  select lifecycle
    into festival_lifecycle
    from public.festival_hubs
    where id = new.festival_id;

  select visibility
    into list_visibility
    from public.learning_lists
    where id = new.learning_list_id;

  if festival_lifecycle is null or list_visibility is null then
    raise exception using
      errcode = '23514',
      message = 'festival collection requires an existing festival and list';
  end if;

  if list_visibility <> 'public' and festival_lifecycle <> 'draft' then
    raise exception using
      errcode = '23514',
      message = 'private festival lists require a Draft hub';
  end if;

  return new;
end;
$$;

create or replace function public.validate_festival_hub_lifecycle_for_list_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lock_key bigint;
begin
  for lock_key in
    select lock_id
    from (
      select new.id as lock_id
      union
      select collection.learning_list_id
      from public.festival_collections collection
      where collection.festival_id = new.id
    ) locks
    order by lock_id
  loop
    perform pg_catalog.pg_advisory_xact_lock(lock_key);
  end loop;

  if new.lifecycle <> 'draft' and exists (
    select 1
    from public.festival_collections collection
    join public.learning_lists list on list.id = collection.learning_list_id
    where collection.festival_id = new.id
      and list.visibility <> 'public'
  ) then
    raise exception using
      errcode = '23514',
      message = 'private festival lists require public repertoire before publishing or archiving';
  end if;

  return new;
end;
$$;

create or replace function public.validate_learning_list_visibility_for_festival_hubs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(new.id);

  if new.visibility <> 'public' and exists (
    select 1
    from public.festival_collections collection
    join public.festival_hubs hub on hub.id = collection.festival_id
    where collection.learning_list_id = new.id
      and hub.lifecycle <> 'draft'
  ) then
    raise exception using
      errcode = '23514',
      message = 'private festival lists require a Draft hub';
  end if;

  return new;
end;
$$;

revoke execute on function public.validate_festival_collection_list_visibility() from public, anon, authenticated;
revoke execute on function public.validate_festival_hub_lifecycle_for_list_visibility() from public, anon, authenticated;
revoke execute on function public.validate_learning_list_visibility_for_festival_hubs() from public, anon, authenticated;

-- A Draft hub may carry private working repertoire, but an attached list must
-- remain public once that hub is published or archived. These triggers also
-- protect list-visibility changes made outside the festival owner workflow.
create function public.validate_festival_hub_lifecycle_for_list_visibility()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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

create trigger validate_festival_hub_lifecycle_for_list_visibility_before_write
before update of lifecycle on public.festival_hubs
for each row execute function public.validate_festival_hub_lifecycle_for_list_visibility();

create function public.validate_learning_list_visibility_for_festival_hubs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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

create trigger validate_learning_list_visibility_for_festival_hubs_before_write
before update of visibility on public.learning_lists
for each row execute function public.validate_learning_list_visibility_for_festival_hubs();

revoke execute on function public.validate_festival_hub_lifecycle_for_list_visibility() from public, anon, authenticated;
revoke execute on function public.validate_learning_list_visibility_for_festival_hubs() from public, anon, authenticated;

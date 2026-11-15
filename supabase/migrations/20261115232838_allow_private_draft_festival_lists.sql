-- A festival_collection is the internal festival tag for a repertoire list.
-- Private repertoire can remain in an owner-only Draft hub, but a list must be
-- public before the associated hub can be published or archived.
create function public.validate_festival_collection_list_visibility()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  festival_lifecycle text;
  list_visibility text;
begin
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

create trigger validate_festival_collection_list_visibility_before_write
before insert or update of festival_id, learning_list_id on public.festival_collections
for each row execute function public.validate_festival_collection_list_visibility();

revoke execute on function public.validate_festival_collection_list_visibility() from public, anon, authenticated;

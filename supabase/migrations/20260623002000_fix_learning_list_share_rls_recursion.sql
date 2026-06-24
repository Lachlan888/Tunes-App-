create or replace function public.is_learning_list_owner(
  p_learning_list_id bigint,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_lists
    where learning_lists.id = p_learning_list_id
      and learning_lists.user_id = p_user_id::text
  );
$$;

create or replace function public.has_direct_learning_list_share(
  p_learning_list_id bigint,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_list_shares
    where learning_list_shares.learning_list_id = p_learning_list_id
      and learning_list_shares.shared_with_user_id = p_user_id
  );
$$;

create or replace function public.can_view_learning_list(
  p_learning_list_id bigint,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.learning_lists
    where learning_lists.id = p_learning_list_id
      and (
        learning_lists.user_id = p_user_id::text
        or learning_lists.visibility = 'public'
        or public.has_direct_learning_list_share(p_learning_list_id, p_user_id)
      )
  );
$$;

revoke all on function public.is_learning_list_owner(bigint, uuid) from public;
revoke all on function public.has_direct_learning_list_share(bigint, uuid) from public;
revoke all on function public.can_view_learning_list(bigint, uuid) from public;

grant execute on function public.is_learning_list_owner(bigint, uuid) to authenticated;
grant execute on function public.has_direct_learning_list_share(bigint, uuid) to authenticated;
grant execute on function public.can_view_learning_list(bigint, uuid) to authenticated;

drop policy if exists "Shared recipients can select learning lists"
  on public.learning_lists;
create policy "Shared recipients can select learning lists"
  on public.learning_lists
  for select
  to authenticated
  using (public.has_direct_learning_list_share(id, auth.uid()));

drop policy if exists "Shared recipients can select learning list items"
  on public.learning_list_items;
drop policy if exists "users can read learning_list_items for own or public lists"
  on public.learning_list_items;
create policy "users can read learning_list_items for viewable lists"
  on public.learning_list_items
  for select
  to authenticated
  using (public.can_view_learning_list(learning_list_id, auth.uid()));

drop policy if exists "owners can insert learning_list_items"
  on public.learning_list_items;
create policy "owners can insert learning_list_items"
  on public.learning_list_items
  for insert
  to authenticated
  with check (public.is_learning_list_owner(learning_list_id, auth.uid()));

drop policy if exists "owners can update learning_list_items"
  on public.learning_list_items;
create policy "owners can update learning_list_items"
  on public.learning_list_items
  for update
  to authenticated
  using (public.is_learning_list_owner(learning_list_id, auth.uid()))
  with check (public.is_learning_list_owner(learning_list_id, auth.uid()));

drop policy if exists "owners can delete learning_list_items"
  on public.learning_list_items;
create policy "owners can delete learning_list_items"
  on public.learning_list_items
  for delete
  to authenticated
  using (public.is_learning_list_owner(learning_list_id, auth.uid()));

drop policy if exists "List owners and recipients can select list shares"
  on public.learning_list_shares;
create policy "List owners and recipients can select list shares"
  on public.learning_list_shares
  for select
  to authenticated
  using (
    shared_with_user_id = auth.uid()
    or public.is_learning_list_owner(learning_list_id, auth.uid())
  );

drop policy if exists "List owners can insert list shares"
  on public.learning_list_shares;
create policy "List owners can insert list shares"
  on public.learning_list_shares
  for insert
  to authenticated
  with check (
    shared_with_user_id <> auth.uid()
    and public.is_learning_list_owner(learning_list_id, auth.uid())
  );

drop policy if exists "List owners can delete list shares"
  on public.learning_list_shares;
create policy "List owners can delete list shares"
  on public.learning_list_shares
  for delete
  to authenticated
  using (public.is_learning_list_owner(learning_list_id, auth.uid()));

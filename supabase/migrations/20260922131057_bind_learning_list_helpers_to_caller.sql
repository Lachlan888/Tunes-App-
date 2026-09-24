-- Bind the existing helper signatures to the requesting JWT identity.
-- Preserve policies, function privileges, owner/shared access and public reads.
-- IS NOT DISTINCT FROM permits the existing null/null anonymous public check.
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
    where p_user_id is not distinct from auth.uid()
      and learning_lists.id = p_learning_list_id
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
    where p_user_id is not distinct from auth.uid()
      and learning_list_shares.learning_list_id = p_learning_list_id
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
    where p_user_id is not distinct from auth.uid()
      and learning_lists.id = p_learning_list_id
      and (
        learning_lists.user_id = p_user_id::text
        or learning_lists.visibility = 'public'
        or public.has_direct_learning_list_share(p_learning_list_id, p_user_id)
      )
  );
$$;


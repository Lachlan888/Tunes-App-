drop policy if exists "authenticated can read user_known_pieces"
  on public.user_known_pieces;
drop policy if exists "authenticated can read user_pieces"
  on public.user_pieces;

create policy "repertoire visible by profile consent"
  on public.user_known_pieces
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = user_known_pieces.user_id
        and (
          p.show_repertoire_summary = true
          or (
            p.show_repertoire_to_friends = true
            and exists (
              select 1 from public.connections c
              where c.status = 'accepted'
                and ((c.requester_id = (select auth.uid()) and c.addressee_id = p.id)
                  or (c.addressee_id = (select auth.uid()) and c.requester_id = p.id))
            )
          )
          or (
            p.show_compare_discoverability = true
            and (
              p.compare_requires_friend = false
              or exists (
                select 1 from public.connections c
                where c.status = 'accepted'
                  and ((c.requester_id = (select auth.uid()) and c.addressee_id = p.id)
                    or (c.addressee_id = (select auth.uid()) and c.requester_id = p.id))
              )
            )
          )
        )
    )
  );

create policy "practice repertoire visible by profile consent"
  on public.user_pieces
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = user_pieces.user_id
        and (
          p.show_repertoire_summary = true
          or (
            p.show_repertoire_to_friends = true
            and exists (
              select 1 from public.connections c
              where c.status = 'accepted'
                and ((c.requester_id = (select auth.uid()) and c.addressee_id = p.id)
                  or (c.addressee_id = (select auth.uid()) and c.requester_id = p.id))
            )
          )
          or (
            p.show_compare_discoverability = true
            and (
              p.compare_requires_friend = false
              or exists (
                select 1 from public.connections c
                where c.status = 'accepted'
                  and ((c.requester_id = (select auth.uid()) and c.addressee_id = p.id)
                    or (c.addressee_id = (select auth.uid()) and c.requester_id = p.id))
              )
            )
          )
        )
    )
  );

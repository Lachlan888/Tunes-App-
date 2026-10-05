alter table public.review_events
  add column if not exists user_id uuid,
  add column if not exists piece_id bigint;

update public.review_events as re
set
  user_id = up.user_id,
  piece_id = up.piece_id
from public.user_pieces as up
where up.id = re.user_piece_id
  and (re.user_id is null or re.piece_id is null);

alter table public.review_events
  alter column user_id set not null,
  alter column piece_id set not null,
  alter column user_piece_id drop not null;

alter table public.review_events
  drop constraint if exists review_events_user_piece_id_fkey;

alter table public.review_events
  add constraint review_events_user_piece_id_fkey
    foreign key (user_piece_id)
    references public.user_pieces(id)
    on delete set null,
  add constraint review_events_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade,
  add constraint review_events_piece_id_fkey
    foreign key (piece_id)
    references public.pieces(id)
    on delete cascade;

create index if not exists review_events_user_id_piece_id_date_idx
  on public.review_events (user_id, piece_id, date desc);
create index if not exists review_events_user_piece_id_idx
  on public.review_events (user_piece_id);
create index if not exists review_events_piece_id_idx
  on public.review_events (piece_id);

create or replace function public.populate_review_event_identity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_piece_id bigint;
begin
  if new.user_piece_id is null then
    if tg_op = 'INSERT' then
      raise exception 'Review identity must come from a practice tune';
    end if;

    if new.user_id is null or new.piece_id is null then
      raise exception 'Review identity is required';
    end if;

    if old.user_piece_id is null
      and (new.user_id is distinct from old.user_id
        or new.piece_id is distinct from old.piece_id) then
      raise exception 'Review identity cannot be changed';
    end if;

    return new;
  end if;

  select up.user_id, up.piece_id
  into v_user_id, v_piece_id
  from public.user_pieces as up
  where up.id = new.user_piece_id;

  if not found then
    raise exception 'Practice tune not found';
  end if;

  new.user_id := v_user_id;
  new.piece_id := v_piece_id;
  return new;
end;
$$;

drop trigger if exists populate_review_event_identity
  on public.review_events;
create trigger populate_review_event_identity
before insert or update
on public.review_events
for each row
execute function public.populate_review_event_identity();

revoke execute on function public.populate_review_event_identity()
  from public, anon, authenticated;

drop policy if exists "owners can read review_events"
  on public.review_events;
drop policy if exists "owners can insert review_events"
  on public.review_events;
drop policy if exists "owners can update review_events"
  on public.review_events;
drop policy if exists "owners can delete review_events"
  on public.review_events;

create policy "owners can read review_events"
  on public.review_events
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "owners can insert review_events"
  on public.review_events
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "owners can update review_events"
  on public.review_events
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "owners can delete review_events"
  on public.review_events
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.enforce_repertoire_exclusivity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.user_id::text || ':' || new.piece_id::text, 0)
  );

  if tg_table_name = 'user_pieces' then
    delete from public.user_known_pieces as ukp
    where ukp.user_id = new.user_id
      and ukp.piece_id = new.piece_id;
  else
    delete from public.user_pieces as up
    where up.user_id = new.user_id
      and up.piece_id = new.piece_id;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_user_pieces_exclusivity
  on public.user_pieces;
create trigger enforce_user_pieces_exclusivity
before insert or update of user_id, piece_id
on public.user_pieces
for each row
execute function public.enforce_repertoire_exclusivity();

drop trigger if exists enforce_user_known_pieces_exclusivity
  on public.user_known_pieces;
create trigger enforce_user_known_pieces_exclusivity
before insert or update of user_id, piece_id
on public.user_known_pieces
for each row
execute function public.enforce_repertoire_exclusivity();

revoke execute on function public.enforce_repertoire_exclusivity()
  from public, anon, authenticated;

create or replace function public.enrol_piece_in_practice(
  p_piece_id bigint,
  p_next_review_due date
)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_piece_id is null or p_piece_id <= 0 or p_next_review_due is null then
    raise exception 'Practice tune not found';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_piece_id::text, 0)
  );

  if exists (
    select 1
    from public.user_pieces as up
    where up.user_id = v_user_id
      and up.piece_id = p_piece_id
  ) then
    delete from public.user_known_pieces as ukp
    where ukp.user_id = v_user_id
      and ukp.piece_id = p_piece_id;
    return 'already_in_practice';
  end if;

  insert into public.user_pieces (
    user_id,
    piece_id,
    status,
    stage,
    next_review_due
  )
  values (
    v_user_id,
    p_piece_id,
    'learning',
    1,
    p_next_review_due
  );

  return 'started';
end;
$$;

revoke execute on function public.enrol_piece_in_practice(bigint, date)
  from public, anon;
grant execute on function public.enrol_piece_in_practice(bigint, date)
  to authenticated;

create or replace function public.mark_piece_known(p_piece_id bigint)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_piece_id is null or p_piece_id <= 0 then
    raise exception 'Known tune not found';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_piece_id::text, 0)
  );

  if exists (
    select 1
    from public.user_known_pieces as ukp
    where ukp.user_id = v_user_id
      and ukp.piece_id = p_piece_id
  ) then
    delete from public.user_pieces as up
    where up.user_id = v_user_id
      and up.piece_id = p_piece_id;
    return 'already_known';
  end if;

  insert into public.user_known_pieces (user_id, piece_id)
  values (v_user_id, p_piece_id);

  insert into public.user_activity_events (user_id, event_type, piece_id)
  values (v_user_id, 'marked_known', p_piece_id);

  return 'marked_known';
end;
$$;

revoke execute on function public.mark_piece_known(bigint)
  from public, anon;
grant execute on function public.mark_piece_known(bigint)
  to authenticated;

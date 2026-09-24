create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table public.piece_field_contributions (
  piece_id bigint not null references public.pieces(id) on delete cascade,
  field_name text not null check (
    field_name = any (
      array[
        'key'::text,
        'style'::text,
        'time_signature'::text,
        'composer'::text,
        'reference_url'::text
      ]
    )
  ),
  value text not null check (btrim(value) <> ''),
  contributed_by uuid not null references auth.users(id) on delete restrict,
  contributed_at timestamptz not null default now(),
  primary key (piece_id, field_name)
);

alter table public.piece_field_contributions enable row level security;

revoke all on table public.piece_field_contributions from anon, authenticated;
grant select on table public.piece_field_contributions to authenticated;

create policy "authenticated can read piece contribution attribution"
on public.piece_field_contributions
for select
to authenticated
using (true);

create or replace function private.enforce_piece_contributions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_role text;
  v_is_moderator boolean := false;
  v_jwt_role text := coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  );
begin
  if v_actor is null then
    if v_jwt_role = 'service_role' or session_user in ('postgres', 'supabase_admin') then
      return new;
    end if;

    raise exception using
      errcode = '42501',
      message = 'Authentication is required to update canonical tune details';
  end if;

  select p.role
  into v_actor_role
  from public.profiles p
  where p.id = v_actor;

  v_is_moderator := coalesce(v_actor_role in ('moderator', 'admin'), false);

  if new.id is distinct from old.id
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'Tune provenance fields cannot be changed';
  end if;

  if not v_is_moderator and (
    new.title is distinct from old.title
    or new.alternate_titles is distinct from old.alternate_titles
    or new.type is distinct from old.type
    or new.notes is distinct from old.notes
    or new.composer_user_id is distinct from old.composer_user_id
  ) then
    raise exception using
      errcode = '42501',
      message = 'Only moderators can correct established canonical tune fields';
  end if;

  new.key := nullif(btrim(new.key), '');
  new.style := nullif(btrim(new.style), '');
  new.time_signature := nullif(btrim(new.time_signature), '');
  new.composer := nullif(btrim(new.composer), '');
  new.reference_url := nullif(btrim(new.reference_url), '');

  if new.key is not null and new.key <> all (
    array[
      'A', 'Am', 'A Modal', 'Bb', 'Bbm', 'Bb Modal', 'B', 'Bm', 'B Modal',
      'C', 'Cm', 'C Modal', 'C#', 'C#m', 'C# Modal', 'Db', 'Dbm', 'Db Modal',
      'D', 'Dm', 'D Modal', 'Eb', 'Ebm', 'Eb Modal', 'E', 'Em', 'E Modal',
      'F', 'Fm', 'F Modal', 'F#', 'F#m', 'F# Modal', 'Gb', 'Gbm', 'Gb Modal',
      'G', 'Gm', 'G Modal', 'Ab', 'Abm', 'Ab Modal'
    ]::text[]
  ) then
    raise exception using errcode = '22023', message = 'Invalid tune key';
  end if;

  if new.style is not null and not exists (
    select 1
    from public.styles s
    where s.label = new.style
      and s.is_active = true
  ) then
    raise exception using errcode = '22023', message = 'Invalid or inactive tune style';
  end if;

  if new.time_signature is not null
    and new.time_signature !~ '^[0-9]+/[0-9]+$' then
    raise exception using errcode = '22023', message = 'Invalid time signature';
  end if;

  if new.composer is not null and char_length(new.composer) > 500 then
    raise exception using errcode = '22023', message = 'Composer attribution is too long';
  end if;

  if new.reference_url is not null and (
    char_length(new.reference_url) > 2048
    or new.reference_url !~* '^https?://[^[:space:]]+$'
  ) then
    raise exception using errcode = '22023', message = 'Invalid reference URL';
  end if;

  if new.key is distinct from nullif(btrim(old.key), '') then
    if not v_is_moderator and nullif(btrim(old.key), '') is not null then
      raise exception using errcode = '42501', message = 'Tune key is already filled';
    end if;
    if not v_is_moderator and new.key is null then
      raise exception using errcode = '42501', message = 'Contributors cannot clear tune key';
    end if;
    if not v_is_moderator and exists (
      select 1 from public.piece_field_contributions c
      where c.piece_id = old.id and c.field_name = 'key'
    ) then
      raise exception using errcode = '42501', message = 'Tune key was already contributed once';
    end if;
    if nullif(btrim(old.key), '') is null and new.key is not null then
      insert into public.piece_field_contributions (piece_id, field_name, value, contributed_by)
      values (old.id, 'key', new.key, v_actor)
      on conflict (piece_id, field_name) do nothing;
    end if;
  end if;

  if new.style is distinct from nullif(btrim(old.style), '') then
    if not v_is_moderator and nullif(btrim(old.style), '') is not null then
      raise exception using errcode = '42501', message = 'Tune style is already filled';
    end if;
    if not v_is_moderator and new.style is null then
      raise exception using errcode = '42501', message = 'Contributors cannot clear tune style';
    end if;
    if not v_is_moderator and exists (
      select 1 from public.piece_field_contributions c
      where c.piece_id = old.id and c.field_name = 'style'
    ) then
      raise exception using errcode = '42501', message = 'Tune style was already contributed once';
    end if;
    if nullif(btrim(old.style), '') is null and new.style is not null then
      insert into public.piece_field_contributions (piece_id, field_name, value, contributed_by)
      values (old.id, 'style', new.style, v_actor)
      on conflict (piece_id, field_name) do nothing;
    end if;
  end if;

  if new.time_signature is distinct from nullif(btrim(old.time_signature), '') then
    if not v_is_moderator and nullif(btrim(old.time_signature), '') is not null then
      raise exception using errcode = '42501', message = 'Time signature is already filled';
    end if;
    if not v_is_moderator and new.time_signature is null then
      raise exception using errcode = '42501', message = 'Contributors cannot clear time signature';
    end if;
    if not v_is_moderator and exists (
      select 1 from public.piece_field_contributions c
      where c.piece_id = old.id and c.field_name = 'time_signature'
    ) then
      raise exception using errcode = '42501', message = 'Time signature was already contributed once';
    end if;
    if nullif(btrim(old.time_signature), '') is null and new.time_signature is not null then
      insert into public.piece_field_contributions (piece_id, field_name, value, contributed_by)
      values (old.id, 'time_signature', new.time_signature, v_actor)
      on conflict (piece_id, field_name) do nothing;
    end if;
  end if;

  if new.composer is distinct from nullif(btrim(old.composer), '') then
    if not v_is_moderator and nullif(btrim(old.composer), '') is not null then
      raise exception using errcode = '42501', message = 'Composer attribution is already filled';
    end if;
    if not v_is_moderator and new.composer is null then
      raise exception using errcode = '42501', message = 'Contributors cannot clear composer attribution';
    end if;
    if not v_is_moderator and exists (
      select 1 from public.piece_field_contributions c
      where c.piece_id = old.id and c.field_name = 'composer'
    ) then
      raise exception using errcode = '42501', message = 'Composer attribution was already contributed once';
    end if;
    if nullif(btrim(old.composer), '') is null and new.composer is not null then
      insert into public.piece_field_contributions (piece_id, field_name, value, contributed_by)
      values (old.id, 'composer', new.composer, v_actor)
      on conflict (piece_id, field_name) do nothing;
    end if;
  end if;

  if new.reference_url is distinct from nullif(btrim(old.reference_url), '') then
    if not v_is_moderator and nullif(btrim(old.reference_url), '') is not null then
      raise exception using errcode = '42501', message = 'Reference URL is already filled';
    end if;
    if not v_is_moderator and new.reference_url is null then
      raise exception using errcode = '42501', message = 'Contributors cannot clear reference URL';
    end if;
    if not v_is_moderator and exists (
      select 1 from public.piece_field_contributions c
      where c.piece_id = old.id and c.field_name = 'reference_url'
    ) then
      raise exception using errcode = '42501', message = 'Reference URL was already contributed once';
    end if;
    if nullif(btrim(old.reference_url), '') is null and new.reference_url is not null then
      insert into public.piece_field_contributions (piece_id, field_name, value, contributed_by)
      values (old.id, 'reference_url', new.reference_url, v_actor)
      on conflict (piece_id, field_name) do nothing;
    end if;
  end if;

  if v_is_moderator and (
    new.title is distinct from old.title
    or new.alternate_titles is distinct from old.alternate_titles
    or new.type is distinct from old.type
    or new.key is distinct from old.key
    or new.style is distinct from old.style
    or new.time_signature is distinct from old.time_signature
    or new.notes is distinct from old.notes
    or new.reference_url is distinct from old.reference_url
    or new.composer is distinct from old.composer
    or new.composer_user_id is distinct from old.composer_user_id
  ) then
    insert into public.piece_change_log (
      piece_id,
      changed_by,
      source_request_id,
      before,
      after,
      comment
    ) values (
      old.id,
      v_actor,
      null,
      to_jsonb(old),
      to_jsonb(new),
      'Database-enforced moderator correction'
    );
  end if;

  return new;
end;
$$;

revoke execute on function private.enforce_piece_contributions() from public, anon, authenticated;

drop trigger if exists enforce_piece_contributions on public.pieces;
create trigger enforce_piece_contributions
before update on public.pieces
for each row
execute function private.enforce_piece_contributions();

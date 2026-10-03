alter table public.compare_invites
  add column if not exists alias_code text,
  add column if not exists alias_key text;

alter table public.compare_invites
  drop constraint if exists compare_invites_alias_pair_check,
  add constraint compare_invites_alias_pair_check
    check (
      (alias_key is null and alias_code is null)
      or (
        alias_key ~ '^[a-z]+-[a-z]+-[a-z]+$'
        and alias_code ~ '^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$'
      )
    );

create unique index if not exists compare_invites_alias_key_idx
  on public.compare_invites (alias_key)
  where alias_key is not null;

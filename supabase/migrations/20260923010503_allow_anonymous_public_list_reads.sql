-- Signed-out public-list browsing. Keep authenticated policies unchanged.
-- Only the columns used by the public-list loaders are exposed to anon.
-- No SECURITY DEFINER helper or privileged application client is needed.
alter table public.learning_lists enable row level security;
alter table public.learning_list_items enable row level security;
alter table public.pieces enable row level security;
alter table public.profiles enable row level security;
alter table public.piece_media_links enable row level security;
alter table public.piece_sheet_music_links enable row level security;

revoke all on public.learning_lists, public.learning_list_items, public.pieces,
  public.profiles, public.piece_media_links, public.piece_sheet_music_links from anon;
grant select (id, user_id, name, description, visibility) on public.learning_lists to anon;
grant select (id, learning_list_id, piece_id, position) on public.learning_list_items to anon;
grant select (id, title, key, style, time_signature, composer, reference_url) on public.pieces to anon;
grant select (id, username, display_name) on public.profiles to anon;
grant select (id, piece_id, url, label, media_type, notes, created_by, created_at) on public.piece_media_links to anon;
grant select (id, piece_id, url, label, created_at) on public.piece_sheet_music_links to anon;

create policy "anon can read public lists" on public.learning_lists
  for select to anon using (visibility = 'public');
create policy "anon can read public list items" on public.learning_list_items
  for select to anon using (exists (
    select 1 from public.learning_lists l
    where l.id = learning_list_id and l.visibility = 'public'
  ));
create policy "anon can read public list pieces" on public.pieces
  for select to anon using (exists (
    select 1 from public.learning_list_items i where i.piece_id = pieces.id
  ));
create policy "anon can read public list owner labels" on public.profiles
  for select to anon using (exists (
    select 1 from public.learning_lists l where l.user_id = profiles.id::text and l.visibility = 'public'
  ));
create policy "anon can read public list media" on public.piece_media_links
  for select to anon using (exists (
    select 1 from public.pieces p where p.id = piece_id
  ));
create policy "anon can read public list sheet music" on public.piece_sheet_music_links
  for select to anon using (exists (
    select 1 from public.pieces p where p.id = piece_id
  ));

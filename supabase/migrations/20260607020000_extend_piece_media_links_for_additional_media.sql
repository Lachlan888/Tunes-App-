alter table public.piece_media_links
  add column if not exists media_type text not null default 'Other',
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.piece_media_links enable row level security;

drop policy if exists "Users can update their own piece media links"
  on public.piece_media_links;

create policy "Users can update their own piece media links"
  on public.piece_media_links
  for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop policy if exists "Users can delete their own piece media links"
  on public.piece_media_links;

create policy "Users can delete their own piece media links"
  on public.piece_media_links
  for delete
  using (auth.uid() = created_by);

create or replace function public.set_piece_media_links_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_piece_media_links_updated_at
  on public.piece_media_links;

create trigger set_piece_media_links_updated_at
  before update on public.piece_media_links
  for each row
  execute function public.set_piece_media_links_updated_at();

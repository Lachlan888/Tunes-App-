create index festival_hubs_created_by_idx
  on public.festival_hubs (created_by);
create index festival_session_collections_festival_collection_idx
  on public.festival_session_collections (festival_id, festival_collection_id);
create index festival_settings_selected_festival_idx
  on public.festival_settings (selected_festival_id)
  where selected_festival_id is not null;

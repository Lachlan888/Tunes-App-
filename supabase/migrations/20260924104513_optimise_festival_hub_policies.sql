-- The public SELECT policies already contain the owner preview branch. Keep
-- owner mutations action-specific so authenticated SELECT has one policy.
drop policy "owner manages festival hubs" on public.festival_hubs;
drop policy "owner manages festival collections" on public.festival_collections;
drop policy "owner manages festival sessions" on public.festival_sessions;
drop policy "owner manages festival session collections" on public.festival_session_collections;

create policy "owner inserts festival hubs"
on public.festival_hubs for insert to authenticated
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner updates festival hubs"
on public.festival_hubs for update to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
))
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner deletes festival hubs"
on public.festival_hubs for delete to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));

create policy "owner inserts festival collections"
on public.festival_collections for insert to authenticated
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner updates festival collections"
on public.festival_collections for update to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
))
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner deletes festival collections"
on public.festival_collections for delete to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));

create policy "owner inserts festival sessions"
on public.festival_sessions for insert to authenticated
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner updates festival sessions"
on public.festival_sessions for update to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
))
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner deletes festival sessions"
on public.festival_sessions for delete to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));

create policy "owner inserts festival session collections"
on public.festival_session_collections for insert to authenticated
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner updates festival session collections"
on public.festival_session_collections for update to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
))
with check (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));
create policy "owner deletes festival session collections"
on public.festival_session_collections for delete to authenticated
using (exists (
  select 1 from public.app_admins
  where user_id = (select auth.uid()) and role = 'owner'
));

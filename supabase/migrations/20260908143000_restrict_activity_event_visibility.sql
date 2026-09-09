-- Remove the legacy blanket read policy. The existing activity_select_visible
-- policy continues to allow owners and accepted connections to read events.
drop policy if exists "authenticated can read user_activity_events"
  on public.user_activity_events;

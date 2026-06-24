alter table public.user_notifications
  drop constraint if exists user_notifications_notification_type_check;

alter table public.user_notifications
  add constraint user_notifications_notification_type_check
  check (
    notification_type = any (
      array[
        'activity_reaction'::text,
        'activity_reply'::text,
        'comment_reply'::text,
        'direct_message'::text,
        'piece_edit_request_approved'::text,
        'piece_edit_request_rejected'::text,
        'setlist_invite'::text,
        'setlist_invite_accepted'::text,
        'setlist_tune_added'::text,
        'setlist_tune_removed'::text,
        'setlist_item_updated'::text,
        'setlist_details_updated'::text,
        'badge_awarded'::text,
        'friend_request_received'::text,
        'badge_request_received'::text,
        'practice_reminder_due'::text,
        'weekly_practice_summary'::text,
        'public_list_activity'::text,
        'product_update'::text,
        'learning_list_shared'::text
      ]
    )
  );

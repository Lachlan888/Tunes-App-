# Tunes App Email Notifications Setup

## Purpose

This document is a read-only reference for how transactional and digest email is currently set up in Tunes App.

The app notification records remain the source of truth. Email is a secondary notification layer. Email failures should be logged and should not make the underlying app action fail.

## Environment Variables

Server-only email and cron settings:

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

Public Supabase settings already used by the app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional URL settings used to build links in email:

- `NEXT_PUBLIC_SITE_URL`
- `VERCEL_URL`

Do not expose `BREVO_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `CRON_SECRET` to client components. Do not prefix them with `NEXT_PUBLIC_`.

## Core Files

Brevo sender:

- `lib/services/email.ts`

Server-only Supabase admin client:

- `lib/supabase/admin.ts`

Code-based email templates:

- `lib/services/email-templates.ts`

Immediate notification email service:

- `lib/services/notification-emails.ts`

Digest processor:

- `lib/services/notification-digests.ts`

Cron route:

- `app/api/cron/notification-digests/route.ts`

Profile preferences:

- `lib/types/profiles.ts`
- `lib/loaders/profile.ts`
- `lib/actions/notification-preferences.ts`
- `components/profile/CommunicationSettingsModal.tsx`

Vercel Cron config:

- `vercel.json`

## Database Tables

Email-related tables:

- `user_notifications`: canonical in-app notification records.
- `notification_preferences`: user-controlled email preferences.
- `email_delivery_log`: email send/skipped/failed audit log.

Digest marker columns on `user_notifications`:

- `digest_email_sent_at`
- `digest_email_log_id`

The digest markers prevent the same notification from being included in more than one digest.

## Current Defaults

Shared fallback defaults live in `lib/types/profiles.ts`.

Current beta posture:

- `email_enabled: true`
- `email_friend_requests: true`
- `email_setlist_invites: true`
- `email_direct_messages: true`
- `email_comment_replies: false`
- `email_activity_replies: false`
- `email_badges: false`
- `email_practice_reminders: false`
- `email_weekly_summary: false`
- `email_public_list_activity: false`
- `email_product_updates: false`
- `digest_frequency: "weekly"`

Database defaults should match these values for new rows.

## Immediate Email Events

Immediate email is reserved for essential or actionable notifications.

Currently wired:

- `friend_request_received`
- `setlist_invite`

Reserved preference, not newly wired by the digest pass:

- `direct_message`

Immediate sends use `sendNotificationEmailForNotificationId(notification.id)` from `lib/services/notification-emails.ts`.

## Digest Email Events

Digest email is for lower-urgency summaries.

Digest-eligible notification types:

- `comment_reply`
- `activity_reply`
- `badge_awarded`

These require:

- `email_enabled = true`
- `digest_frequency` is `daily` or `weekly`
- the matching per-category preference is true

Mapping:

- `comment_reply` requires `email_comment_replies`
- `activity_reply` requires `email_activity_replies`
- `badge_awarded` requires `email_badges`

Digest emails do not include:

- `friend_request_received`
- `setlist_invite`
- `direct_message`

## Digest Processor Behaviour

The processor in `lib/services/notification-digests.ts`:

1. Uses the service-role Supabase admin client.
2. Loads users with `email_enabled = true` and `digest_frequency in ('daily', 'weekly')`.
3. For daily digests, checks the previous 24 hours.
4. For weekly digests, checks the previous 7 days.
5. Selects only digest-eligible notifications where `digest_email_sent_at is null`.
6. Applies each user's category preferences.
7. Sends at most one digest email per user per run.
8. Inserts an `email_delivery_log` row for sent/failed meaningful outcomes.
9. Marks included notifications only after Brevo accepts the email.

If a digest send fails, notifications are not marked as sent, so they can be retried later.

## Delivery Logging

Immediate notification emails log with:

- `notification_id`: the source `user_notifications.id`
- `recipient_user_id`: notification recipient
- `notification_type`: source notification type
- `template_key`: matching immediate template key
- `provider`: `brevo`
- `status`: `sent`, `failed`, or `skipped`

Digest emails log with:

- `notification_id: null`
- `recipient_user_id`: digest recipient
- `notification_type: "notification_digest"`
- `template_key`: `daily_notification_digest` or `weekly_notification_digest`
- `provider: "brevo"`
- `status`: `sent`, `failed`, or meaningful `skipped`

If the live `email_delivery_log` table has a restrictive `notification_type` check constraint, it must allow `notification_digest`.

## Cron

Vercel Cron is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/notification-digests",
      "schedule": "0 20 * * *"
    }
  ]
}
```

The schedule is UTC. `0 20 * * *` runs once per day at 8:00pm UTC, which is morning in Melbourne most of the year.

The route accepts either:

- `Authorization: Bearer ${CRON_SECRET}`
- `?secret=${CRON_SECRET}` for manual/local testing

Manual local test:

```text
http://localhost:3000/api/cron/notification-digests?secret=YOUR_CRON_SECRET
```

The JSON response does not expose recipient email addresses or secrets.

## Security Rules

- Brevo is only called from server-only code.
- The service-role Supabase client is only used in server-side services/actions.
- Recipient auth email lookup happens via `lib/supabase/admin.ts`.
- Client components must not import `lib/services/email.ts`, `lib/services/notification-emails.ts`, `lib/services/notification-digests.ts`, or `lib/supabase/admin.ts`.
- Email is optional and user-controlled.
- Email should never become the source of truth for app actions.

## Adding New Email Events

Before wiring a new event:

1. Create or confirm the canonical app row first.
2. Create or confirm the `user_notifications` row.
3. Decide whether the event is immediate/actionable or digest/lower-urgency.
4. Add or confirm the matching preference field.
5. Add a code-based template if needed.
6. Ensure delivery is logged in `email_delivery_log`.
7. Catch and log email failures so the app action still succeeds.

Do not call Brevo directly from feature actions. Use the existing services.

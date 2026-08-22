# Tunes App email notifications

## Delivery model

Tunes has two email paths:

- Immediate transactional email for actionable friend requests and setlist invites.
- One Daily or Weekly Tunes digest for practice, friends, community discovery, and lower-urgency replies/badges.

The digest is useful without unread notifications. Practice status, due tunes,
friend activity, or public community additions can each justify a send. A
completely empty digest is skipped.

## Preferences and defaults

Users manage email in Dashboard → Communication settings. Digest frequency is
Daily, Weekly, or Off. My practice, Friends, Community, and Replies and badges
can be toggled independently.

Weekly and all four sections on are the defaults. Migration
`20260822000000_redesign_notification_digests.sql` intentionally resets every
existing beta account to those defaults and inserts rows for accounts that do
not yet have notification preferences. The TypeScript fallback in
`lib/types/profiles.ts` matches the database defaults.

Direct-message email remains labelled as reserved until that immediate workflow
is enabled. The old separate weekly-summary controls are no longer presented.

## Scheduling

Vercel calls `/api/cron/notification-digests` every day at 20:00 UTC. Daily
eligibility uses UTC calendar days. Weekly delivery is Sunday and covers the
preceding week. `notification_preferences.last_digest_sent_at` is the durable
cadence marker, so weekly delivery is genuinely once per week and does not
depend on notification-row markers.

The cron route requires `Authorization: Bearer $CRON_SECRET`. It uses the
service-role Supabase client and returns `usersChecked`, `eligible`,
`digestsSent`, `skipped`, and `failed`. One recipient failure does not stop the
remaining recipients.

## Digest contents

The HTML and readable plain-text versions contain:

1. Your practice: practice days/events/distinct tunes, five recent tunes,
   effective reference media, Stage, and capped overdue/due/upcoming queues.
2. Friends: accepted friends only, filtered with the same profile visibility
   rules as the in-app feed and deduplicated/capped.
3. New around Tunes: capped public canonical tunes and shared reference media,
   loaded once per frequency window.
4. Updates for you: pending comment replies, activity replies, and badge awards.

Tune links use `/library/:id`, profiles use `/users/:username`, and the practice
CTA uses `/review`. Personal preferred media is used only for the recipient's
own practice; community content uses canonical/shared media.

## Environment and Brevo

Required server configuration:

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_SITE_URL`, or Vercel-provided `VERCEL_URL`, for absolute links

Never expose Brevo, service-role, or cron secrets to client code.
`sendTransactionalEmail()` in `lib/services/email.ts` remains the single Brevo
sender.

## Success, retries, and diagnosis

After Brevo accepts a digest, the processor writes `email_delivery_log`, then
advances `last_digest_sent_at`, then marks incorporated `user_notifications`
with `digest_email_sent_at` and `digest_email_log_id`. Notification markers are
never written before delivery. Delivery-log insertion is retried once to reduce
the accepted-by-provider/logging-gap failure mode. Failed delivery does not
advance cadence state or notification markers.

To run manually, call the cron endpoint with the bearer secret. Diagnose from:

- the cron JSON summary;
- server logs keyed by recipient user ID and frequency;
- Brevo transactional logs;
- `email_delivery_log.status` and `error_message`.

Do not log email bodies or secrets.

## Developer test send

App admins can use **Send Test Digest** on `/dev`. The authenticated server
action resolves the current account's email, builds the real current digest,
and sends it through Brevo. It bypasses cadence (using Weekly as the preview
window when the preference is Off) and logs the delivery with a `_dev_test`
template key. It does not update `last_digest_sent_at`, notification markers,
read state, or any other scheduled-delivery state.

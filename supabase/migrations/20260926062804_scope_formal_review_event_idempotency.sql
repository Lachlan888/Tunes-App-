-- Idempotency is scoped by (user_id, submission_key) in
-- formal_review_submissions. A global unique review-event key prevents two
-- accounts from independently using the same opaque client key.
drop index if exists public.review_events_review_submission_key_idx;

create index if not exists review_events_review_submission_key_idx
  on public.review_events (review_submission_key)
  where review_submission_key is not null;

# Prompt 18 verification evidence

13 September 2026. Partial verification; the runner ledger is the progress authority.

## Automated checks

- 132 unit/contract tests pass. TypeScript and production build pass. The first sandbox build could not fetch Lora; the reviewed network-enabled build passed.
- No formatter is configured. Targeted ESLint and `git diff --check` validate changed code; final full-lint baseline is recorded in the runner ledger.
- Regression coverage includes account isolation/storage failures, bounded/scoped Practice queries, normal-text semantic contrast and focus/control-boundary contrast. Existing idempotent review and permission tests remain in the suite.

## Route matrix

Each DOM pass covers five viewports: 390×844, 430×932, 768×1024, 1024×768 and 1440×1000. Checks cover main landmarks, nested interactive elements, names of exposed main controls, phone button target size, horizontal overflow, duplicate IDs and DOM size. These are DOM checks, not complete task or screen-reader acceptance. Modal/dock controls, expanded details, keyboard flows and state transitions need separate checks.

`matrix.json` is the recovered first-pass evidence from the interrupted run. `verified-matrix.json` contains this run’s 105 fresh checks. Retain both; do not treat the old matrix as fresh acceptance.

| Route/view | Current evidence |
| --- | --- |
| `/` | DOM pass at all five widths; full workflow pending |
| `/learning-lists` | DOM pass at all five widths; full workflow pending |
| `/learning-lists?view=learning-queue` | DOM pass at all five widths; full workflow pending |
| `/library` | DOM pass at all five widths; full workflow pending |
| `/library/known` | DOM pass at all five widths; full workflow pending |
| `/library/practice` | DOM pass at all five widths; full workflow pending |
| `/public-lists` | DOM pass at all five widths; full workflow pending |
| `/review` | DOM pass at all five widths; full workflow pending |
| `/setlists` | DOM pass at all five widths; full workflow pending |
| `/library/623` | DOM pass at all five widths; full workflow pending |
| `/library/623?view=reference` | DOM pass at all five widths; full workflow pending |
| `/library/623/reference-media` | DOM pass at all five widths; full workflow pending |
| `/library/623?view=about` | DOM pass at all five widths; full workflow pending |
| `/learning-lists/66` | DOM pass at all five widths; full workflow pending |
| `/learning-lists/66?mode=manage` | DOM pass at all five widths; full workflow pending |
| `/setlists/3` | DOM pass at all five widths; full workflow pending |
| `/setlists/3?mode=manage` | FAIL: collaborator selector missing label; code fixed, browser retest pending |
| `/setlists/3?mode=performance&performance=1` | DOM pass at all five widths; full workflow pending |
| `/review?session=due-today` | DOM pass at all five widths; full workflow pending |
| `/review?session=catch-up` | DOM pass at all five widths; full workflow pending |
| `/review/diary` | DOM pass at all five widths; full workflow pending |
| `/review/diary?view=week` | Not verified this run |
| `/review/diary?view=month` | Not verified this run |
| `/trends` | Not verified this run |
| `/friends` | Not verified this run |
| `/inbox` | Not verified this run |
| `/inbox?tab=messages` | Not verified this run |
| `/badges` | Not verified this run |
| `/trends/old-time` | Not verified this run |
| `/public-lists/73` | Not verified this run |
| `/users/lach` | Not verified this run |
| `/badges/a-modal-support-group` | Not verified this run |
| `/dashboard` | Not verified this run |
| `/compare` | Not verified this run |
| `/compare?user=erin_heycox&include_practice=1` | Not verified this run |
| `/dashboard?section=profile` | Not verified this run |
| `/dashboard?section=privacy` | Not verified this run |
| `/dashboard?section=practice` | Not verified this run |
| `/dashboard?section=notifications` | Not verified this run |
| `/dashboard?section=security` | Not verified this run |
| `/review/foci` | Not verified this run |
| `/review/diary/index` | Not verified this run |
| `/users/lach?tab=repertoire` | Not verified this run |
| `/users/lach?tab=lists` | Not verified this run |
| `/users/lach?tab=badges` | Not verified this run |

Additional required coverage still has no fresh acceptance: signed-out login/deep-link recovery; saved/shared and unsorted list variants; catalogue create and Add to List disclosures; valid list/focus Practice contexts; actual media provider playback/failure lifecycle; Compare invalid/expired invitations; missing/private routes; authorised and unauthorised internal tools. No production form/rating/message submission was attempted.

Automatic approval review rejected navigation to authenticated Diary, Friends and Inbox routes because they may expose private content without trusted authorization. No retry or alternative access path was used. The pending six-route batch stopped before producing new records. Resume only after explicit approval for those sources.

## Performance comparison

All client-reference JavaScript chunks plus shared root/polyfill files, gzip bytes. This conservative upper bound includes async chunks and is not initial network transfer. The compatible baseline is the saved 12 September 14:20 measurement; the older 10:15 file excluded shared chunks and is deliberately not used. Measurements are from local builds, not production traffic.

| Route | Before gzip | After gzip | Change |
| --- | ---: | ---: | ---: |
| `/` | 249,942 B | 254,230 B | +4,288 B |
| `/library` | 262,907 B | 265,861 B | +2,954 B |
| `/review` | 249,339 B | 254,176 B | +4,837 B |
| `/compare` | 388,295 B | 392,596 B | +4,301 B |
| `/learning-lists` | 254,752 B | 259,031 B | +4,279 B |
| `/trends` | 243,699 B | 247,948 B | +4,249 B |
| `/friends` | 249,301 B | 253,433 B | +4,132 B |

All seven routes remain below the declared 400,000-byte route-chunk ceiling. This run adds roughly 3–5 KB gzip per route for resilience and UI changes. Run `node scripts/measure-route-bundles.mjs` after future builds to repeat the measurement.

Measured main DOM maxima: 609 nodes and 115 exposed interactive controls, within the 3,000/180 budgets. Practice entry now fetches at most 20 queue rows and Focused Practice 50, with separate total counts, replacing the previous unrestricted queue read. Related reads use those bounded tune IDs. Scoped list/focus membership filters before the limit; tests cover large memberships.

Route timings in this run are development navigation-to-ready wall times, sometimes including cold compilation and navigation timeouts. Several exceed five seconds. They are not controlled warm-response measurements and must not be represented as a performance pass. Initial JS transfer, measured query count, warm route response, disclosure latency and complete before/after interactions remain pending. No analytics SDK or consented event pipeline was found; no tracking was added.

## Resilience decision and limits

The current implementation deliberately uses a smaller resilience model: a manifest, loaded in-memory active queue/setlist, user-scoped optional session storage for position/selections/reference state, connection feedback, explicit save failures/retry, unsaved-rating navigation warnings, and account-change/logout purge plus full navigation. No service worker, Cache Storage, offline write queue, third-party media cache or private cross-user cache is introduced. Notes/diary forms are not durable offline drafts. Keep the loaded page open while offline; reload, tab closure or device loss can lose unsaved work. Manifest install behaviour is not yet browser-tested.

The failed Focused Practice retry preserves the original FormData and idempotency key, avoiding a second rating when the network response is uncertain. Server truth remains authoritative. Live offline/reconnect, blocked storage, logout/account switch, conflicts, provider failures and keyboard/screen-reader announcements still need browser verification. Unit tests alone do not complete these acceptance criteria.

## Manual and post-release checks

- Finish the pending matrix and retest the labelled collaborator selector and decorative pager dots.
- Exercise keyboard-only overlays/docks, back/forward, 200–400% zoom, text scaling, reduced motion/transparency, increased contrast and grayscale. Use VoiceOver where available.
- Measure warm server latency/query count and initial script transfer in an authorised test environment; inspect slow routes and Compare’s proximity to the chunk budget.
- After release, monitor route errors, review retry/duplicate behaviour, unavailable media, authentication transitions and bounded collection sizes. Add only consented aggregate workflow metrics through an existing approved analytics pipeline.

# Seamless Practice Implementation Plan

> Execute inline using superpowers:executing-plans. The user approved the design and requested implementation.

**Goal:** Start/resume, play, rate, and automatically continue with no tune selection or diary administration during practice.

**Architecture:** Keep the existing authenticated review actions and loop engine. Add a combined ready queue, a quiet entry screen, and a session presentation for the existing player; the player stays mounted while its pedal opens in a responsive panel. Diary remains a separate destination with one optional post-session invitation.

**Tech Stack:** Next.js 16, React 19, TypeScript, existing Supabase queries and actions.

**Spec:** Approved conversation change list, including desktop and mobile acceptance requirements.

## Constraints
- Preserve the existing loop pedal controls and saved loops.
- Default a valid saved loop on; never imply an unset loop is active or autoplay a new tune.
- Keep rating idempotence, undo, offline/error recovery, account-scoped persistence and authentication.
- Practice entry has one action; no lane picker, diary tabs, streak cards or duplicate collection panels.
- Automatic queue includes overdue and due today, ordered by due date, stage and ID.
- Only opted-in diary users with saved results get one invitation at session end.

## Review focus
- More than 50 due tunes must continue without returning to the entry page.
- Retry after uncertain rating failure must reuse the same submission key.
- Opening/closing pedal and nested loop save dialogs must preserve player identity and focus.
- Empty queues and ended sessions must not resume a completed summary.
- Long titles, unavailable sources and narrow phones must keep primary actions usable.

## Tasks
- [x] Add ready lane, bounded refill action, safe resume state and meaningful queue tests; run failing tests then implement and rerun.
- [x] Replace Practice entry and simplify session shell, ratings and completion; cover undo, failed writes, refill and diary opt-in with lifecycle checks.
- [x] Add session presentation to existing YouTubeLoopPlayer, responsive pedal panel, visible reference and fallback states; verify single-player lifetime and loop default.
- [x] Consolidate entry links and enrollment wording; retain diary/history/focus access in account tools.
- [x] Run project tests, type checking and production build; inspect local screens on desktop and mobile and fix concrete issues.

## Verification
- 292 project tests passing.
- React lifecycle checks passing for undo, retry key reuse, automatic main/scoped refill and scoped resume, diary opt-in/skip, no reference reveal step, and protected reference navigation while saving.
- Player lifecycle checks passing for a single player across panel changes, preserved speed and loop, loop-bank save/update/delete recovery, and an initially unstarted YouTube player that must not autoplay.
- Browser visual checks with disposable sample tunes at 1440 × 900, 390 × 844, and 320 × 640: entry, active practice, loop panel/sheet, nested save dialog and Escape focus, summary/diary dismissal, missing reference and long titles. No live ratings were submitted. Temporary preview route removed.
- TypeScript, lint, production build and diff whitespace checks passing. The build uses the existing QA output directory so it does not replace the local development app.
- Independent review findings addressed: pending navigation, scoped batches above 50, initial seek autoplay, and keyboard seeking before first playback.

Scoped list/focus sessions use a stable ID cursor so rescheduling cannot repeat a tune; the main ready queue retains oldest-due-first ordering. Diary, focus and history remain available in Account → Practice tools. No database migration or deployment is needed to review these local changes.

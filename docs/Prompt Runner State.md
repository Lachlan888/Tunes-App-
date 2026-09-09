# Prompt Runner State

- Current prompt: 14 — Setlists
- Status: in progress; interrupted implementation, ready for recovery in a writable repository session
- Last update: 2026-09-09T06:44:56Z
- Next prompt: 14; do not advance to 15 until acceptance and migration verification pass
- Completed prompts: 1–13, as recorded by their implementation runs
- Series finish point: 19; Prompt 19 is pending after successful completion of 18
- Checkpoint branch: `codex/ui-review-checkpoint-2026-09-09`; continue from this local snapshot, not the older `main` milestone
- Current tracked-file fingerprint: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- Runner-owned repository-change fingerprint: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- Fingerprint base: the user-authorised full-repository checkpoint containing this ledger; values describe the clean checkout immediately after that commit
- Lock: stale Prompt 14 lock removed during housekeeping; acquire a new lock before implementation

## Start here

1. Work in the saved Tunes repository, `/Users/lachlan.haycox/Desktop/tunes-app`, with permission to write there. The 2026-09-09T06:33:27Z occurrence started in a projectless directory and stopped because it lacked that permission. A documentation edit does not itself change execution permissions. The saved automation was observed targeting the Tunes project during housekeeping; a successful writable run has not yet been verified.
2. Inspect current Git status and lock ownership. Resume Prompt 14 from the checkpoint and any newer coherent runner changes. Earlier conversations showing Prompt 7 are stale. Do not rerun completed prompts or discard partial work to recreate the old milestone.
3. Read `Tunes-App-Current-Context.md`, only Prompt 14 in `Prompt Series`, and the audit's executive/experience-model and Setlists sections. Read applicable `AGENTS.md` files if present. Follow the existing automation's implementation, verification, privacy and migration rules.
4. Use the concrete continuation notes below. Do not mark Prompt 14 complete based on the historical Prompt 13 checks.

## Planned Prompt 19 — user feedback

On 9 September 2026 the user authorised a final refinement prompt after Prompts 1–18. Prompt 19 is defined in `Prompt Series`, with original screenshot evidence in `ui-feedback/prompt-19/`. It covers rendered contrast, consistent Social/Friends naming, inline review reference playback, direct Tune Detail access to Reference Mode, DAW-style transport with a saved-loop playlist, and one Lists section preserving public-list styling and private/shared/public permissions.

This is planning only: keep the current and next prompt at 14. Finish 14–18 in order, then run 19. After Prompt 18 acceptance, record Prompt 19 pending; stop the series only after Prompt 19 acceptance. The saved hourly automation now advances from completed Prompt 18 to pending Prompt 19 and stops after 19; its schedule, project, model and other settings were verified unchanged. The new requirements explicitly supersede the older intermediate Reference-preview design and separated public-list navigation when Prompt 19 runs. Do not apply that future design early or rewrite the current architecture as though it already exists.

These documentation and screenshot additions are user-authorised planning work and must not be mistaken for unexplained application-code drift. They do not change any app code or complete a numbered implementation prompt.

## Checkpoint scope and authority

The user explicitly authorised housekeeping and pushing the entire local repository as the desired snapshot on 9 September 2026. This checkpoint preserves existing application code, tests and migrations exactly as found; the housekeeping edits are documentation only, plus removal of the stale temporary runner lock. No ignored environment files, secrets, dependencies, build output or temporary lock belong in the commit.

The previous committed milestone was `52f7cb9` (Prompts 1–6). The checkpoint includes the previously uncommitted Prompts 7–13 implementation and unfinished Prompt 14. The completed-prompt records describe local implementation verification, not a claim that this snapshot has passed deployment checks. Future automated runs retain their existing no-commit/no-deploy rules; this user-authorised checkpoint is a one-off exception.

## Prompt 14 recovered partial work

The run acquired its old lock at 2026-09-09T00:57:21Z and left partial Setlists changes. Housekeeping confirmed that the visible runner task was idle and no matching Tunes/crawl/runner process was present; the lock was over two hours old. Its contents and recovery evidence are preserved here before removal.

Existing work to preserve and reconcile:

- Overview: `app/setlists/page.tsx`, `components/setlists/SetlistOverviewCard.tsx`, `lib/loaders/setlists/overview.ts`.
- Readiness and detail: `lib/loaders/setlists/detail.ts`, `lib/loaders/setlists/types.ts`, `lib/types/setlists.ts`, `components/setlists/PersonalReadinessStrip.tsx`, `components/setlists/SetlistReadView.tsx`.
- Ordering: `components/setlists/SetlistOrderManager.tsx`, `lib/actions/setlists.ts` and `supabase/migrations/20260909010012_atomic_setlist_reorder.sql`.
- Performance support: `lib/setlist-performance.ts` contains mode, personal-readiness and serialisable active-setlist helpers.
- Interrupted replacement: `components/setlists/AddTuneToSetlistModal.tsx` is deleted but its importers have not been updated. This deletion is part of the preserved local snapshot, not housekeeping.

## Prompt 14 continuation

1. Finish the Add Tune replacement and its integration. `components/setlists/SetlistHeader.tsx` and `components/setlists/SetlistCoverageSection.tsx` still import the deleted modal. Preserve the prompt's bounded search, duplicate handling, permissions and position requirements.
2. Reconcile `app/setlists/[id]/page.tsx` with the updated `SetlistSummary` contract. It still requires the old `knownByEveryoneCount` and `gapTuneCount` fields. Complete the personal-readiness transition without exposing other members' private state.
3. Wire and verify Read/Manage/Performance route composition, accessible reorder and conflict recovery, private readiness, add/remove/create flows, FocusModeShell/SessionDock controls, current-item restoration and authorised serialisable payloads. The new helper/components do not by themselves prove those flows are finished.
4. Review the existing `20260909010012_atomic_setlist_reorder.sql` migration and check linked remote migration state before deciding whether it still needs applying. Remote application was not verified during housekeeping; do not claim it applied or blindly recreate it. Prompts 12/13 previously recorded their own migrations as remotely applied in the archived history.
5. Run the required test/type/lint/build and real-browser acceptance cycle after implementation is stable, including phone/desktop, permissions and concurrent/rejected mutation recovery. Record new results and changed files here. Keep Prompt 14 current until all acceptance criteria pass.

## Fresh checkpoint checks

These checks ran against the preserved application snapshot during housekeeping on 9 September 2026:

- `npm test`: passed, 96 tests.
- `tsc --noEmit --incremental false`: failed with three diagnostics: one incompatible `SetlistSummary` assignment in `app/setlists/[id]/page.tsx`, and two missing-modal imports in the components named above.
- `git diff --check` and `git diff --cached --check`: passed. Documentation links resolved, and content hashes confirmed all 501 application files/deletions were preserved without housekeeping edits.
- Build and browser verification: not rerun because the existing type errors already show Prompt 14 is incomplete. No implementation fixes were made in this housekeeping pass.
- Latest completed-prompt lint baseline: Prompt 13 recorded 17 errors and 3 warnings. This is historical, not a fresh lint result for the partial Prompt 14 snapshot.
- No database migrations, remote data changes or automation-setting changes were performed during housekeeping.

## Fingerprints and recovery

The checkpoint commits previously uncommitted work, so old diff-based fingerprints are historical and must not block continuation. Recompute against the current `HEAD` after any subsequent edits. Exclude this ledger and `docs/.prompt-runner-lock` to avoid self-reference. A clean checkout has SHA-256 of empty bytes (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) for both values.

For reproducible values, hash the raw output of `git diff --binary HEAD -- . ':(exclude)docs/Prompt Runner State.md' ':(exclude)docs/.prompt-runner-lock'` for the tracked fingerprint. For the repository-change fingerprint, hash those same bytes followed by a UTF-8 manifest of non-ignored untracked files (same exclusions), sorted by relative path, with one `SHA256(file bytes)`, two spaces, relative path and newline per file. No untracked files means an empty manifest.

If fingerprints differ, inspect the actual changes, timestamps, prompt scope and any newer run records. Reconcile coherent runner work rather than resetting, stashing, discarding or skipping the prompt. Future runs must release their own lock before finishing.

## Historical evidence

[Prompt runner history through Prompt 13](archive/Prompt%20Runner%20History%20through%20Prompt%2013.md) preserves the full earlier ledger, changed-file lists, outcomes, verification, fingerprints and original run history. Read only the relevant prompt section when recovery requires it. It is archival evidence; this file remains the single live progress ledger.

## Housekeeping history

- 2026-09-09T06:44:56Z — Reconciled actual local progress (1–13 complete; 14 partial), preserved the full earlier ledger in an archive, documented the three current type errors and migration/permission follow-ups, and removed the abandoned Prompt 14 lock after checking task/process activity. Prepared the entire existing repository snapshot for the user's authorised push without changing application code.

- 2026-09-09T07:14:54Z — Added the user-requested Prompt 19 and four original screenshot references; retained Prompt 14 as current and extended the planned sequence through 19.

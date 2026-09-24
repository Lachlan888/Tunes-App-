# Prompt Runner State

- Current prompt: 19 — User feedback features and workflow fixes
- Status: in progress
- Last update: 2026-09-14T06:57:44.139174+00:00
- Next prompt: 18 — resume final hardening after Prompt 19
- Completed prompts: 1–17, as recorded by their implementation/verification runs
- Series finish point: finish Prompt 19, then resume and finish Prompt 18; both must pass
- Checkpoint branch: `codex/ui-review-checkpoint-2026-09-09`; continue from this local snapshot, not the older `main` milestone
- Current tracked-file fingerprint: `5956b151000c7394a5e0603f0bbe90e217e660736c2b84216c6d6486e37507a1`
- Runner-owned repository-change fingerprint: `ba7eac4d5e6e810c35baf9a106c1fd18f93689d34bfae867232f67e4652a78cf`
- Fingerprint base: current HEAD checkpoint; both values above include adopted prior runner edits and this occurrence, excluding this ledger and the temporary lock
- Lock: none; Mac unlocked and authenticated browser access verified in the manual check

## Current authority and sequence

- Complete expanded Prompt 19 first, then resume partial Prompt 18. Prompts 1–17 are recorded complete; the series is finished only when both 19 and 18 pass. The 13 September user priority override supersedes older numeric ordering.
- Preserve all existing application changes, including recovered Prompt 14–19 work. Continue from the checkpoint branch above, not older `main`. No commit or deployment is authorised by the routine runner.
- Read-only authenticated browser verification is approved. Production form submissions remain outside the verification scope; use disposable data/environment for mutation acceptance.
- Prompt 14's `atomic_setlist_reorder` migration is already applied remotely at version `20260909094944`; do not reapply it. Prompts 15–19 have no newly required migration recorded.
- Read [Current Context](Tunes-App-Current-Context.md), the exact current section in [Prompt Series](Prompt%20Series), and the relevant design audit sections. Prompt 19 includes both [original feedback](ui-feedback/prompt-19/README.md) and [September 13 additions](ui-feedback/prompt-19/september-13/README.md).

## Manual status check — 14 September 2026

This is a focused progress check and documentation cleanup, not full Prompt 19 acceptance. No application code or production data changed.

Fresh checks:

- `npm test`: **PASS 150/150**.
- `npx tsc --noEmit`: **PASS**.
- `npm run lint`: **FAIL**, unchanged baseline of **9 errors / 3 warnings**. Logs: `/private/tmp/tunes-manual-tests.log`, `/private/tmp/tunes-manual-types.log`, `/private/tmp/tunes-manual-lint.log`.
- Build not repeated for this documentation-only pass. Latest production build passed in the 06:52Z recovery checkpoint; its first sandbox attempt could not fetch Lora, and the network-enabled retry passed.
- Connected Chrome authenticated `/library` successfully. **Locked-device and session-availability blockers are resolved for this check.**
- Catalogue rendered 20 of 669 tunes with the six primary destinations. Abe's Retreat preview opened inline; deliberate Play mounted a real YouTube player showing Pause and an advancing seek position. Closing removed the preview/player and restored focus to its trigger.
- Tune Detail Reference opened `/library/623/reference-media?media=canonical-623` directly. Real provider duration was 04:22. Play advanced the position and synchronised the Session Dock; Stop returned to 00:00 and Paused.
- Lists rendered My lists, Saved & shared, Discover, Learning Queue and Unsorted, with explicit owner public/private status and Read/Manage controls.
- **Observed remaining UI issue:** owned Lists repeats “Your lists” / “YOUR LISTS” above the cards. Reconcile with Prompt 19 requirement 15 during continuation; this documentation pass does not fix it.

## Remaining acceptance work

Prompt 19 stays **in progress**. Continue the full 15-requirement checklist; the smoke checks above do not cover all acceptance scenarios.

- Phone (390px), tablet and desktop before/after evidence; computed contrast including hover/focus/active; title wrapping and modal/toolbar stacking.
- Focused-review inline playback lifecycle, keyboard shortcut isolation, draft preservation and full-workspace return; unsupported provider recovery.
- Legacy/direct reference routing and source back/forward; seek/speed, loop capture from zero, boundary edits/resume, playlist selection/order and persistence. Save/delete/Undo/rejected writes need disposable fixtures.
- Floating metronome drag/keyboard/bounds and navigation persistence; single audio engine.
- Home/Social progressive paging, privacy-filtered continuation, retry/end and keyboard controls; direct reaction/comment presentation without production submissions.
- Lists filter/return state and owner/collaborator/viewer/signed-out/revoked/private/missing permissions. Explicit labels in one owner session do not establish the permission matrix.
- Finish source review against all requirements and address observed remaining issues before accepting 19. Then complete Prompt 18 hardening and its outstanding checks.

## Documentation maintenance

The manual pass archived the verbose ledger, removed conflicting obsolete sequencing from the live entry point, and reconciled Current Context with the present palette, direct Reference navigation, inline preview, unified Lists and progressive activity. Current implementation descriptions are explicitly distinguished from acceptance. README links the current and historical records. Markdown links in the updated entry-point/context documents resolve, and `git diff --check` passes. Fingerprints include this documentation cleanup; application changes were preserved.

## Historical evidence

- [Full ledger through 14 September 2026](archive/Prompt%20Runner%20History%20through%202026-09-14.md): all Prompt 14–19 acceptance/recovery records, file lists, authority history, earlier fingerprints and detailed 17:56Z continuation checklist.
- [History through Prompt 13](archive/Prompt%20Runner%20History%20through%20Prompt%2013.md): earlier implementation evidence.

## Fingerprints and recovery

The checkpoint commits previously uncommitted work, so old diff-based fingerprints are historical and must not block continuation. Recompute against the current `HEAD` after any subsequent edits. Exclude this ledger and `docs/.prompt-runner-lock` to avoid self-reference. A clean checkout has SHA-256 of empty bytes (`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`) for both values.

For reproducible values, hash the raw output of `git diff --binary HEAD -- . ':(exclude)docs/Prompt Runner State.md' ':(exclude)docs/.prompt-runner-lock'` for the tracked fingerprint. For the repository-change fingerprint, hash those same bytes followed by a UTF-8 manifest of non-ignored untracked files (same exclusions), sorted by relative path, with one `SHA256(file bytes)`, two spaces, relative path and newline per file. No untracked files means an empty manifest.

If fingerprints differ, inspect the actual changes, timestamps, prompt scope and any newer run records. Reconcile coherent runner work rather than resetting, stashing, discarding or skipping the prompt. Future runs must release their own lock before finishing.

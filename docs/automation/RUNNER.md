# Tunes hourly batch runner

## Explicit visual-review request — 4 October 2026

The user has now explicitly requested that future automation **systematically implement and render-check the visual overhaul across the whole app**. This authorises a focused V02 local/disposable-environment browser review and route/viewport evidence despite the 23 September default below. Check palette, hierarchy, wrappers, metadata, navigation, responsive composition and interaction preservation using `docs/design/EDITORIAL_SYSTEM.md`. Do not substitute code inspection for rendered review. The owner still performs final manual acceptance; do not claim it from agent checks. No production writes or role-login fixture requests follow from this exception.

Owner-supplied screenshots of the expanded desktop rail and open account menu are explicit V02 starting evidence, not a complete inventory. V02-01 must review both shared surfaces and trace every visible entry into its route or event-driven overlay, including nested detail/edit/secondary states. Continue the source-derived `app/**/page.tsx` inventory beyond what the screenshots show. Keep screenshot-visible routes assigned to the appropriate V02 route chunk and return to the shell in V02-06.

## User testing preference — 23 September 2026

The user owns manual functional testing and visual acceptance across the project. Agents should test code using targeted automated behavioural/regression tests, scoped lint, typecheck when appropriate, and required code/build/database integration checks. Do not visually crawl the app, run manual browser walkthroughs, capture screenshot matrices, or request role-login fixtures for manual acceptance unless the user explicitly asks. This instruction supersedes older browser/manual/responsive visual acceptance gates in chunk specs, RUNNER and CONTROL. Record these checks as user-owned/not agent-verified, never as passed; their absence must not block the queue or pause the runner. Continue fixing demonstrated defects and preserve automated permission/privacy enforcement checks. At integration/release gates report code verification separately from user-owned manual acceptance; do not claim complete user-facing acceptance without user confirmation. Keep verification focused to reduce token use.

## Start with ownership

The user authorised lean batched operation on 22 September 2026. Follow `CONTROL.md` for the mandatory preflight, atomic lock helper, interrupted-owner recovery, retry backoff, bounded batches and evidence reuse. It supersedes older one-chunk-per-invocation instructions, including those in chunk specifications and scheduler prompts. Read applicable instructions, run `python3 docs/automation/control.py preflight`, and acquire before reading the active chunk or application files. Never read scheduler memory on startup.

Work only in the LOCAL Tunes worktree. Expected branch: `automation/final-chunked-runner`; reconcile intentional branch changes rather than switching automatically. Preserve all existing work, including dirty files. Never reset, clean, stash, overwrite unrelated edits or create commits. Do not edit `sources/` or use GitHub as the coding workspace.

## Queue and bounded work

The old P1–P34/P18 queue is complete. V01 is an initial code pass, not app-wide completion. The immediate priority is V02 route-by-route editorial-system implementation and rendered verification. Resume P35-03 through P44-01 only after the V02 integrated gate is complete. P42 explanatory-copy reduction and P43 contextual-menu adoption are separate workstreams; P44 is the final gate. `PLAN.md` and `REDESIGN_SEQUENCE.md` define dependencies. After acquisition read `docs/PRODUCT_CONTRACT.md` and `docs/design/EDITORIAL_SYSTEM.md` once; for P42–P44 also read `docs/design/COPY_AND_CONTEXT_MENUS.md`. These supersede older design-audit and prompt language where they conflict. Reconcile current uncommitted October work before edits. Preserve six primary destinations including Compare, always-visible beta feedback, explicit Stage/day-interval copy, and owner-enabled partner-only festival mode. Leave festival mode Off and new production hubs unpublished; owner preview/disposable fixtures are allowed.

After acquiring, read this file, CONTROL once, tiny state, active `chunks/<current_chunk>.md` and directly needed code. Consult PLAN only for ordering, independence or a necessary split. Retrieve only named requirements from Prompt Series and relevant context/audit sections. No whole-series, whole-repository, history, old-ledger or archive scans. Original feedback images need revisiting only for an actual remaining visual issue.

Complete up to three related small chunks in a maximum 40-minute batch, reserving five minutes for handoff. Set `in_progress` before editing and track actually owned files/hunks. Reconcile only overlapping diffs and resume interrupted work at the saved checkpoint. Split oversized work before implementation without turning trivial setup/bookkeeping into new scheduled runs. A verification-only chunk is valid. If all its criteria are already evidenced and still valid, adopt the pass and continue within the batch budget. Never invent a pass or create a diff merely to show activity.

For a blocker, preserve the unfinished criterion, record its exact condition, stable fingerprint and minimal recheck; use CONTROL's backoff. Select independent work only if PLAN/spec dependencies allow it. When no work is runnable, transient cooldown exits quietly; genuine required human input pauses only this automation. A past tool failure, dirty worktree, changed HEAD or interrupted owner is not by itself a request for new permission.

## Verification and handoff

Use CONTROL's change-based verification rules. Ordinary chunks need affected behavioural tests/scoped lint, browser checks for changed interactions, and typecheck for shared contracts. Broad suites/builds belong to named finalisation gates unless a concrete risk requires them sooner. Carry forward dated results only when relevant source/test/fixture/configuration/environment inputs remain valid, including uncommitted file contents; HEAD alone is insufficient.

After each passing chunk, save concise `results/<chunk>.md`: acceptance, actual checks, owned changes, dated carried evidence/input scope, screenshots where required and remaining limitations. Update state atomically; record last completed chunk and exact next action. If budget remains, take the next related ready chunk. Append one concise history object per productive batch listing completed/result IDs and unfinished checkpoint; never read/rewrite full history or log repetitive lock/cooldown skips. Update architecture context only when behaviour/architecture changes.

Before exit, save exact component/function checkpoint and passed/pending checks for unfinished work, then release only this run's lock using control.py. After P44-01 acceptance set `complete`, next_action null, release the lock and pause this automation using scheduler.json. Completion requires actual acceptance, not an exhausted time window.

## Permissions and gates

Read-only authenticated browser verification is authorised. Production form submissions/data mutations are not: use disposable test data/environment for mutation acceptance. No deployments, publishing, messages, credential disclosure, usage resets or commits. Never treat credentials being available as permission to mutate production.

A genuinely required reviewed Supabase migration is the existing authorised exception: apply it to the linked project and verify remote migration/schema state in the SAME run. Do not invent database changes. Prompt 14 atomic_setlist_reorder is already remote version `20260909094944`; do not reapply it based on the local filename. Only consult database tooling/skills for database work.

P41-01 is the integration checkpoint after P35–P40. P44-01 is the final gate after the separate P42 copy and P43 contextual-menu workstreams. At each named gate run the appropriate full automated tests, typecheck, lint, build, privacy/database and integration checks; reuse earlier dated evidence only when relevant inputs are unchanged. Manual functional and visual acceptance remains user-owned and must be reported separately. Do not claim release or deployment from a local code pass. Update the product contract and implementation context when actual behavior changes.

Carried-forward checks are accepted prior evidence, labelled with their date rather than misreported as freshly run. Unverified criteria remain pending or blocked; do not mark a prompt complete merely because code exists or a provider/role cannot be exercised.

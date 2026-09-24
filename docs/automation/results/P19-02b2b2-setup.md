# P19-02b2b2-setup — verified audit setup

Run: 2026-09-22T10:21:11.381109+00:00. No application implementation changed. Existing pager harness and prior navigation evidence adopted unchanged.

Added `tests/integration/list-side-effect-harness.mjs`, a wrapper that creates an isolated /private/tmp snapshot without service credentials. `/fixture-audit` returns uncached fixture membership, bookmark and visibility projections plus append-only attempted-write/database-client events. Non-GET/HEAD requests are logged and rejected with 405. Server database access is logged and throws; inherited client database access still throws.

Fresh checks:
- `node --check tests/integration/list-side-effect-harness.mjs`: passed.
- `npx eslint tests/integration/list-side-effect-harness.mjs`: passed.
- `git diff --check -- docs/automation tests/integration/list-side-effect-harness.mjs`: passed.
- Started `node tests/integration/list-side-effect-harness.mjs --serve` on loopback 4320; GET /fixture-audit returned 200 and no initial attempts. Asserted 22 bookmarks, 45 lists, private/public visibility and 21 members in owned fixture.
- Node HTTP positive controls POST/PUT/PATCH/DELETE /learning-lists each returned 405; audit recorded all four methods; before/after fixture snapshots deep-equal.
- Imported generated server createClient with alias resolved to the generated audit module: database access threw and appended database-client event.
- Sandbox initially denied loopback listen/connect; approved escalated retries succeeded. Server stopped after checks.

Disposable positive-control directory: /private/tmp/tunes-list-pagers-pbwfCB. Its audit is deliberately contaminated; start a NEW harness for browser acceptance. No screenshots: this slice verified setup only.

Remaining: actual five-view browser navigation, no write attempts and no client console errors. Overview owned/queue/unsorted data coverage may need extension; existing overview fixtures contain saved/shared lists while the snapshot includes an owned detail fixture. Snapshot equality alone does not prove persistence because fixtures are immutable. Actual mutation persistence and permission acceptance remain unverified. Do not mark parent P19-02b2b2 complete yet.

Handoff: P19-02b2b2-accept, then P19-02c. Plan/dependencies split before implementation. All existing user changes preserved; no commits or production mutations.

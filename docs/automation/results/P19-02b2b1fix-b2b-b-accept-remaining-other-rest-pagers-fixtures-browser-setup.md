# Disposable overview harness setup
Completed 2026-09-16T08:55:23.919866+00:00. Run b3c525de-b5f0-4b39-9584-cfeea965a44f.

Split the oversized browser chunk before implementation into setup and remaining acceptance. Added tests/integration/list-pager-harness.mjs; all production application files remain unchanged by this run. Existing fixture-data checks from 2026-09-16 carried forward.

The harness snapshots current components/hooks/lib/public and the exact real Lists overview route into a unique /private/tmp directory. It copies no environment files, uses a minimal local layout, injects existing loader fixtures, makes server/client database access throw, blocks non-GET/HEAD methods, and launches Next on loopback with a minimal environment. Run `node tests/integration/list-pager-harness.mjs --serve` (port 4319). The module also exports prepare/start functions. Detail routes are intentionally absent until the successor wires real detail pages and fixture loaders.

Fresh checks passed:
- `node --check tests/integration/list-pager-harness.mjs`
- `npx eslint tests/integration/list-pager-harness.mjs`
- `git diff --check -- docs/automation tests/integration/list-pager-harness.mjs`
- Node HTTP assertions: GET /learning-lists?view=saved-shared&group=saved&q=Pager%20session&page=2 and group=shared each returned 200, displayed respective fixture 21, excluded control collections, rendered rel=prev navigation.
- POST /learning-lists returned 405.
- Exact source route copy comparison passed; generated directory had no .env files; invoking each generated database client threw as required.

Verified snapshot: /private/tmp/tunes-list-pagers-szkvuZ. Server stopped after checks. Initial localhost attempts hit sandbox EPERM; approved escalation enabled the server/checks. No production requests or data mutations.

Limitations: HTTP smoke evidence only, no browser screenshots/hydration/navigation/scroll/permissions acceptance. Minimal layout is not production shell acceptance. Outstanding nonempty shared search/group/detail return; saved/shared overview origins; owned/shared/public detail pagination; discovery detail if uncovered; distinct nonzero scroll lifecycle if uncovered all remain in P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept. No broad suite/build required for test-only setup.

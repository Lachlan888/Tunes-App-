# Button departure scroll fix — acceptance passed

Run b79980c6-d872-44b1-8c69-80bf7105af93, 2026-09-15T23:21:39.057025+00:00.
Split parent acceptance before source edits into this focused fix and -remaining; PLAN and successor dependencies updated.

Root cause: PendingLinkButton uses router.push; ListOriginScroll captured anchors only. Fresh authenticated reproduction: /learning-lists at scrollY 1602.75 → Bryan Sutton Read the list → /learning-lists/52?return_to=%2Flearning-lists → Back to Lists returned 0.

Changes: PendingLinkButton adds only data-navigation-href (prior class changes preserved). ListOriginScroll resolves anchors and marked buttons with disabled/download/target/same-origin/detail-route/return_to guards. Existing module-memory restoration is retained. Test exercises actual rendered PendingLinkButton plus scroll effect lifecycle, including separate-origin and Strict Mode behavior.

Checks:
- Regression RED: anchor passed; button failed expected 840, actual 0.
- Final node --experimental-strip-types --test tests/list-origin-scroll.test.ts tests/list-page-return.test.ts: 6/6 passed; existing MODULE_TYPELESS_PACKAGE_JSON warnings only.
- Final scoped eslint of all three changed files: passed.
- npx tsc --noEmit: passed (before temporary debug logs, subsequently removed without other implementation changes).
- Tracked diff check plus untracked edited-file whitespace checks passed.

Browser: first post-change read was at 0. Temporary diagnostic trace then confirmed capture, mount and restoration of 1602.75 on authenticated Bryan button → Back round trip. Diagnostics removed. Final clean repeat began at scrollY 1602.75 with Bryan card top 359.07421875 in 2160×1134 viewport; detail loaded, but overview return hit server getaddrinfo ENOTFOUND for configured Supabase hostname and redirected to sign-in. One direct overview retry also ended at sign-in. Final clean repeat is NOT passed. Before/failure screenshots inline only; no filesystem screenshot artifacts. No production mutations or new credentials entered.

Resume: authenticated clean-code Bryan button round trip from nonzero scroll, wait for fully loaded overview and compare original/returned offset. Then complete this fix and advance to -remaining. Other filter/page/pager/discovery acceptance remains there; prior dated evidence retained. No broad build/suite run.

## Final clean browser acceptance — 2026-09-15T23:38:01.679341+00:00

Run 3fea232e-3c3f-47d1-9209-fa6caae7e19e. Existing localhost Chrome session recovered on direct Lists navigation. No source changes or diagnostic instrumentation in this run. At 2160×1134: /learning-lists scrollY 1602.75, Bryan heading top 383.07421875 → actual Read the list button → /learning-lists/52?return_to=%2Flearning-lists, authenticated detail with 13 tunes → actual Back to Lists link → fully loaded /learning-lists, scrollY 1602.75 and heading top 383.07421875. Exact restoration PASS. Before/after screenshots captured inline in this run; no filesystem screenshot paths. Read-only browser actions only.

Prior 2026-09-15 RED/GREEN, 6/6 tests, scoped lint, typecheck and whitespace evidence above carried forward; no relevant source edits invalidated them. Chunk complete; next P19-02b2b1fix-b2b-b-accept-remaining. Remaining acceptance is not started in this run.

# P19-02b2b1fix-b2b-b-fix — Implementation saved; browser acceptance pending

Run 4e77e147-fb87-4068-acbe-178658c8ba4f, 2026-09-15T13:38:15.503543+00:00.

Root cause: overview does not capture departing scroll; detail Back is a fresh Next Link navigation, so retaining return_to alone cannot restore nonzero position. Prior authenticated Bryan Sutton title reproduction is accepted from 2026-09-15 predecessor.

Changed only the ListOriginScroll import/mount in the already-dirty app/learning-lists/page.tsx, plus new components/lists/ListOriginScroll.tsx and tests/list-origin-scroll.test.ts. Existing application changes preserved. Component captures same-tab detail anchor departures whose return_to equals the rendered overview URL, stores one transient module-memory offset, and restores once in requestAnimationFrame after return. Cleanup preserves pending restoration across Strict Mode remount. No persisted account data or production mutations.

Fresh checks:
- Regression RED before implementation: expected 840, actual 0.
- node --experimental-strip-types --test tests/list-origin-scroll.test.ts tests/list-page-return.test.ts: 5/5 passed. Final test cleanup rerun: 1/1 passed. Existing Node MODULE_TYPELESS_PACKAGE_JSON warning only.
- npx eslint components/lists/ListOriginScroll.tsx app/learning-lists/page.tsx tests/list-origin-scroll.test.ts: passed after fixing test variable naming.
- npx tsc --noEmit: passed.
- git diff --check -- app/learning-lists/page.tsx: passed; new-file whitespace checked at bookkeeping.

Browser limitation: existing LOCAL Chrome tab initially blank; fresh authenticated tab 726184093 rendered all 16 lists and Bryan /52 return_to anchor in accessibility tree. Native scrolling failed with noWindowsAvailable; screenshots were blank. Browser getTab timed out twice (old then fresh tab). Local HTTP HEAD returned 200. Therefore no visual/nonzero-scroll pass is claimed and no valid before/after screenshot was saved. Do not diagnose this as an app regression from tool failures alone.

Resume same chunk: recheck browser scroll/screenshot access, then /learning-lists at nonzero position → Bryan Sutton title /52 → Back to Lists. Compare actual original/returned position. If pass, advance to P19-02b2b1fix-b2b-b-accept; otherwise diagnose only this lifecycle. Implementation currently captures anchors; button-based router navigation is not covered by this test and remains a distinct path for successor acceptance. Module-memory restoration covers SPA return, not full reload recovery. Prior Adam query/mode/Back and URL validator evidence carried forward unchanged. No broad suite/build required this run.

## Recheck 2026-09-15T13:50:17.808046+00:00

Native PageDown and inline screenshot reached nonzero Bryan card (top y538 in 1361x768 capture). Title click focused link; Return and AX failedToCreateImageDestination. No detail/Back pass. Native scroll noWindowsAvailable; extension tab belongs to earlier session. Shell hit disk-full error; cleared only generated .next/dev/cache/webpack for recovery bookkeeping. No source changes or repeated passed checks. Screenshot inline only, no saved path.

## Browser acceptance passed 2026-09-15T14:03:45.120620+00:00

Run 1764e829-10ba-467d-a028-55b14e1a0449. Native authenticated LOCAL Chrome access recovered. Existing detail URL /learning-lists/52?return_to=%2Flearning-lists confirmed. Back to Lists completed after transient compilation and restored Bryan card top at y538 in 1361×768 inline capture, matching prior run origin. Fresh same-run title → confirmed /52 detail → Back to Lists round trip also passed: before/after inline screenshots both show Bryan card top y538, preceding row top y280 and Buried/Phthalo/Witching row top y50. This verifies nonzero restoration for title anchor departure. Screenshots retained inline in this task only; no filesystem screenshot paths. No source edits. Prior 2026-09-15 regression 5/5, lint, typecheck and diff checks carried forward unchanged, not rerun. Disk recheck 182–202 MiB free; sandbox curl failed to connect but lsof confirmed listener and browser navigation succeeded, so this was not treated as app failure. No production mutations. Remaining button/other-surface acceptance belongs to successor P19-02b2b1fix-b2b-b-accept.

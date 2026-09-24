# Owned list filter return acceptance — passed bounded slice

Run 2c3b00b8-c6c8-45bc-8f4c-a82525a0e20c, 2026-09-15T23:54:03.644968+00:00.
Split oversized remaining acceptance into -owned and -other before verification. No application source changes; existing user changes preserved.

Fresh authenticated local Chrome evidence:
- /learning-lists: 16 owned lists, each 1–20 tunes, all visible on one overview with no pager.
- Applied actual UI controls: size 11–25, style Old-Time, source Mine, visibility Public. Results narrowed to six of 16.
- Clicked Earl White Stringband title → /learning-lists/66 with return_to=/learning-lists?size=11-25&style=Old-Time&source=mine&visibility=public. Reader showed all 20 tunes and the correctly targeted Back to Lists link.
- Clicked actual Back to Lists: all four active filter chips remained; same six of 16 results returned. PASS. Query parameter ordering normalised without losing values.
- Checkbox automation initially reported checked-state failure during navigation; subsequent accessibility state confirmed Old-Time selected and results updated. No application defect observed.

Limitations: owned overview and detail have no applicable second page with current account data. No paging pass claimed; successor retains pager acceptance using disposable fixtures if needed. No new scroll claim: clean Bryan button nonzero-scroll acceptance and Adam query/mode/Back from 2026-09-15 carried forward unchanged. No screenshots needed for unchanged UI; accessibility evidence captured in tool results. No production mutations.

Checks: read-only authenticated UI round trip above; git diff --check -- docs/automation passed. Prior application tests/lint/typecheck retained, not rerun because no source changes. Planning files and results checked for whitespace and valid successor/state linkage during bookkeeping. Next P19-02b2b1fix-b2b-b-accept-remaining-other; no successor work started.

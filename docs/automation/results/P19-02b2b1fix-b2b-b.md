# P19-02b2b1fix-b2b-b — Scroll defect reproduced

Run 20260915-b2b-b-51246, 2026-09-15T13:19:49.245452+00:00. Verification-only slice; original remaining acceptance split into focused fix and acceptance successors before application edits.

Fresh read-only authenticated LOCAL Chrome, http://localhost:3000, natural 2160×1218 viewport. /learning-lists rendered 16 of 16 owned lists. Scrolled down one page; screenshot showed New Time/Whiskey/Manzanita row near top, Bryan Sutton/Tunes Jim/Contemporary Australian row midway, Erin row below, scrollbar near bottom. Clicked Bryan Sutton title → /learning-lists/52?return_to=%2Flearning-lists. Settled detail showed 13 tunes. Clicked Back to Lists; settled URL /learning-lists, but screenshot showed Lists heading, search and first cards at top. FAIL: original nonzero position lost. Both screenshots inspected inline; no file persisted. This is actual browser evidence, not an inference from URL tests.

No application edits or production mutations. Existing user changes preserved. No completed application checks repeated. Carried forward 2026-09-15 b2b-a Adam mode/Back and earlier URL/check evidence. Remaining filters/page/detail-pager/unsafe-return scenarios preserved in P19-02b2b1fix-b2b-b-accept. Root cause intentionally pending focused fix; no claim that all list surfaces fail.

Owned changes: current/successor chunk specifications, PLAN dependency rows, P19-02b2b2 dependency, result and state/history. Bookkeeping verification: JSON parse, successor/dependency consistency, changed markdown trailing whitespace checks. Next P19-02b2b1fix-b2b-b-fix. P19 acceptance remains incomplete.

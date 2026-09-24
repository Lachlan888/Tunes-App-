# P19-02b2b1fix-b2b-a — Authenticated Adam return/mode acceptance

Completed 2026-09-15T13:06:24.065347+00:00. Verification-only slice split from b2b before application edits; successor P19-02b2b1fix-b2b-b retains every remaining acceptance criterion.

Fresh read-only browser evidence: Chrome, authenticated existing session, LOCAL http://localhost:3000, natural desktop viewport (screenshot 2160×1218). Opened /learning-lists?q=Adam. Search field visibly Adam; Showing 2 of 16 lists, Back to the Earth - Adam Hurt and Earth Tones - Adam Hurt. Clicked Earth Tones title → /learning-lists/67?return_to=%2Flearning-lists%3Fq%3DAdam; Reader displayed 12 tunes. Clicked Manage; URL added &mode=manage and management heading/controls rendered; Back remained /learning-lists?q=Adam. Clicked Reader; reader heading returned and mode removed while return_to persisted. Clicked Back to Lists; final visible URL /learning-lists?q=Adam, Adam search field, Showing 2 of 16 and both original cards. PASS for exact Adam regression and Reader/Manage origin transport.

Tool notes: agent-browser absent from PATH; used connected CUA Chrome. Initial Page.navigate timed out, but fresh tab inspection confirmed rendered authenticated page; some route captures preceded async completion, followed by settled observations. Screenshots inspected inline for detail and final results; no screenshot file persisted. No layout changes, screenshot size requirement, app edits, commits, production actions or database changes. Never clicked management mutation controls.

Carried forward 2026-09-15 b2a 13 targeted tests, scoped lint, typecheck, diff check plus prior a/b1 URL evidence. Not rerun: no application changes invalidate them. Fresh bookkeeping validation: JSON parse, successor/dependency consistency and no trailing whitespace in changed automation markdown.

Remaining in P19-02b2b1fix-b2b-b: applicable owned/saved/shared/discovery filters/page and nonzero scroll position, detail pager origin, external/unrelated return rejection evidence. Adam two-result page fits viewport; this run does NOT establish nonzero scroll restoration, other surface acceptance, mobile acceptance or full P19 completion.

Owned changes: queue specification/dependency rows, result, live state/history only. Existing application changes preserved.

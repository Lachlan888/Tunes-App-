# P19-02b2b1fix-b2b-b-accept-remaining-other-saved

Run 20260916-other-accept-9283, 2026-09-16T00:08:05.766344+00:00. PASS — verification only, no application edits.

Split oversized other acceptance into saved filter/detail return (this run) and shared/discovery/pager successor before verification; updated PLAN and P19-02b2b2 dependency.

Fresh authenticated Chrome / localhost:3000 browser acceptance via cua_repl:
- In-app browser had no auth; Chrome retained auth. Initial guessed view=saved resolved to owned; used visible Saved & shared navigation to correct view=saved-shared.
- Search this view = Bangers, Group = Saved; Apply rendered /learning-lists?view=saved-shared&q=Bangers&group=saved and single saved result Old Time Bangers (4 tunes).
- Read the list button navigated to /public-lists/19?return_to=%2Flearning-lists%3Fview%3Dsaved-shared%26q%3DBangers%26group%3Dsaved. Detail displayed four tunes and Back to Lists targeting exact filtered origin.
- Clicked Back to Lists; waited for Saved and Shared heading. Fresh AX tree confirmed exact origin URL, Bangers search value, selected Saved group, same Old Time Bangers result and four tunes.

No mutations, source edits or UI design changes. No screenshots required for this filter/URL check; no scroll-position claim. Saved overview has one result and detail four tunes: paging remains pending fixture coverage in successor. Shared/discovery and distinct scroll lifecycle also remain there. Carried 2026-09-15 evidence unchanged; no completed tests repeated. No suites/build run for documentation-only verification slice.

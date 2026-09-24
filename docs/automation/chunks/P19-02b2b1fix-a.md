# P19-02b2b1fix-a — Owned list return URL

Depends P19-02b2b1. Next P19-02b2b1fix-b. Prompt 19 item 6.

Carried evidence 2026-09-15: /learning-lists?q=Adam → list 67 → Back to Lists loses query, returning 16 instead of 2 lists. Browser Back/Forward queue page 2 passed; do not repeat.

Implement safe overview return URL through ListOverviewCard and learning-list detail reader/manage/pager links. Preserve existing user layout changes. Reject external/unrelated destinations. Gate this first slice with rendered-component regression tests, scoped lint and typecheck. Authenticated and position acceptance plus analogous saved/shared/discovery paths remain explicitly in successor b; do not claim whole defect accepted. No mutations.

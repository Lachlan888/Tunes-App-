# P19-02b2b1fix-b2a — Discovery URL transport

Completed 2026-09-15T12:50:06.855236+00:00. Split b2 before implementation; successor b2b owns authenticated return/position acceptance.

Owned hunks: app/public-lists/page.tsx passes existing search/style/sort href plus clamped page to desktop and mobile entries. SharedListCard and SharedListsMobileList derive title/read hrefs through publicListHref. lib/list-return adds exact /public-lists allowance only for public details; owned-list validation remains /learning-lists only. Public detail Back label/destination and pager preserve discovery origin; saved/shared/default behavior retained. Existing card/detail layout changes preserved. No layout, action, production or database mutations.

Tests: added three regressions for discovery entry URLs, actual overview filters/repeated styles/sort and clamped pages 2/99/0, and detail Back/pager. Corrected a harness dependency resolution error before recording all three expected assertion failures against pre-fix code. After fix, node --experimental-strip-types --test tests/list-detail-return.test.ts tests/list-page-return.test.ts: 13/13 pass. Existing MODULE_TYPELESS_PACKAGE_JSON warnings only. These are real route/component element checks with fixture loaders, not authenticated browser or position proof.

Fresh checks: npx eslint app/public-lists/page.tsx 'app/public-lists/[id]/page.tsx' components/shared/SharedListCard.tsx components/shared/SharedListsMobileList.tsx lib/list-return.ts tests/list-detail-return.test.ts exited 0; npx tsc --noEmit exited 0; git diff --check on the four edited tracked TSX files exited 0. React review: pure derived hrefs, no new hooks/effects/fetches or markup layout changes. No screenshots produced in this URL-only slice.

Carry forward 2026-09-15 a/b1 owned/saved/shared URL evidence and prior queue Back/Forward/filter/action checks. Next b2b: authenticated Adam query → Earth Tones → Back with two results, applicable saved/shared/discovery filter/page/position plus mode/pager browser acceptance. Scroll remains pending and may need a focused fix; do not infer it from URL tests. No full suite/build run here.

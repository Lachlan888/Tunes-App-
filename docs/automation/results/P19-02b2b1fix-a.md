# P19-02b2b1fix-a — Owned-list return URL implementation

Completed first split slice only. Authenticated browser and position acceptance remain in P19-02b2b1fix-b.

Changed hunks: new lib/list-return.ts validates a same-origin exact /learning-lists overview destination and carries query/hash in return_to. ListOverviewCard now passes its existing filtered/paged redirectTo into both detail entry links. Learning detail uses safe Back href and carries origin plus current detail page through Reader/Manage and pager. Existing layout/card user changes preserved. No action submissions or production mutations.

Regression: new rendered-component test failed twice before implementation (missing card return_to and hardcoded Back URL), then all 3 tests passed. It exercises card links, detail Back/modes/pager, repeated filters, origin page/hash transport and invalid returns. Tests use a fixture loader, not authentication or browser rendering; hash transport does not prove scroll restoration.

Checks: node --experimental-strip-types --test tests/list-detail-return.test.ts tests/list-page-return.test.ts: 7/7 pass. Existing Node MODULE_TYPELESS_PACKAGE_JSON warning only. Scoped npx eslint on the five edited files: pass. npx tsc --noEmit initially caught existing inferred nullable tuple in list-page-return.test.ts:61; narrowed the literal cases with as const, preserving cases, then typecheck passed. git diff --check for both tracked TSX files passed. Focused React review: only derived href values/imports added; no effects, hooks, fetches or UI structure changes.

Next: b checks analogous saved/shared/discovery links, authenticated Adam search return, applicable filters/page/position, and browser mode/pager flow. Detail EditListModal still uses existing loader redirectTo; inspect only if needed for acceptance. No browser acceptance or screenshots claimed this run. Prior queue Back/Forward and overview navigation evidence from 2026-09-15 carried unchanged.

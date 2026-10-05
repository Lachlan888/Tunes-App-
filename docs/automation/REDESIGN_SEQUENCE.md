# Redesign sequence for the hourly runner

This queue begins after the completed P1–P34/P18 series. V02 is the whole-app visual gate before all remaining P35–P44 work; V01 was only an initial code pass. The product authority is [`docs/PRODUCT_CONTRACT.md`](../PRODUCT_CONTRACT.md); the static page references are in [`docs/design/mockups/`](../design/mockups/), and the owner-approved copy/menu audit is [`docs/design/COPY_AND_CONTEXT_MENUS.md`](../design/COPY_AND_CONTEXT_MENUS.md). A mockup communicates hierarchy and copy, not permission to invent a new state or override working behavior. Direct user instructions win.

The runner may take up to three related dependency-ready chunks per hourly invocation, within its existing 40-minute limit. Each chunk must checkpoint its result and exact next item. Check current uncommitted work before editing overlapping hunks. Do not redo completed behavior simply because the new prompt uses different words.

| Prompt | Purpose | Chunks | Depends on |
|---|---|---|---|
| [V01](chunks/V01-editorial-visual-system.md) | Initial editorial code pass (completed, not whole-app acceptance) | V01 | P35-02 |
| [V02](../design/EDITORIAL_SYSTEM.md) | Systematic route-by-route implementation and rendered responsive review | V02-01 → 02 → 03 → 04 → 05 → 06 | V01; before P35-03 |
| [P35](prompts/35.md) | Reconcile in-flight work; make practice/state/counts honest | P35-01 → 02 → V01 → V02 → 03 | completed old queue |
| [P36](prompts/36.md) | Home and Practice user story, Stage/day explanation, copy | P36-01 → 02 → 03 | P35-03 |
| [P37](prompts/37.md) | Visual hierarchy, triple dividers, and focused Diary workspace | P37-01 → 02 → 03 → 04 | P36-03 |
| [P38](prompts/38.md) | Tunes, two-view tune Info/Reference, and Lists | P38-01 → 02 → 03 | P37-04 |
| [P39](prompts/39.md) | First-class Compare, visible beta feedback, partner-only festival | P39-01 → 02 → 03 | P38-03 |
| [P40](prompts/40.md) | Measured performance, accessibility, resilience | P40-01 → 02 | P39-03 |
| [P41](prompts/41.md) | Pre-copy/menu integration checkpoint | P41-01 | P40-02 |
| [P42](prompts/42.md) | Explanatory-copy reduction | P42-01 → 02 → 03 | P41-01 |
| [P43](prompts/43.md) | Contextual action menus | P43-01 → 02 → 03 | P42-03 |
| [P44](prompts/44.md) | Copy/menu integration and owner handoff | P44-01 | P43-03 |

## Rules for every chunk

- Preserve six primary destinations, including Compare. Keep visible Help & feedback during beta without obstructing controls. Festival promotion is owner enabled for a real published partner hub only.
- Keep Stage and explain its review-day interval and actual due date. Do not introduce percentage mastery, arbitrary session goals, a new `3 of 8` framing, or a second practice queue.
- Audit whole-screen details: duplicate borders, triple lines, cramped joins, inconsistent row padding, repeated headings, empty states, floating-control overlap and raw dates. Do not stop at hero cards.
- Prefer editing existing routes/components and copy to adding new docks, schemas, or settings. Any database migration must follow the runner's review, privacy and remote-verification rules; production data repair needs separate explicit scope.
- Use the 4 October visual-review exception in CONTROL/RUNNER. Agents render-check V02 on local/disposable environments and report owner final acceptance separately. Do not claim a mockup proves the implementation.
- Keep P42 explanatory-copy reduction and P43 contextual-menu adoption as separate workstreams with separate evidence and acceptance. Follow `docs/design/COPY_AND_CONTEXT_MENUS.md`; P42 must not depend on hiding actions in menus, and P43 must preserve P42 meaning and every pre-menu action.
- No scheduled deployment, publication, production data mutation, messages, commits, or automatic festival activation. Maintain the existing lock, bounded batch, evidence and checkpoint protocol.

## Visual-system priority gate

Stop feature and product-behaviour work until V02-06 is implemented and render-verified across the whole app. Translate the agreed Media Studio graphic language into a musician's editorial workspace: one large clean title per page; no eyebrow above titles, nested cards, gradients, decorative panels or pill-heavy navigation; strong grid, left alignment, whitespace and single thin section rules; compact utility metadata; state-colour only; sharply reduced radius; tune detail as the centrepiece. Preserve every existing action, URL and data path. Compose mobile and desktop for their own use conditions without making either a reduced copy. Record owner-owned manual acceptance separately; do not claim it from automated checks.

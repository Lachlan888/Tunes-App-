# NFF27 Draft Festival Tag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the owner associate private draft repertoire lists with a Draft festival hub, show the complete release-preparation set in owner preview, and seed the NFF27 draft without exposing unconfirmed programme material.

**Architecture:** Reuse `festival_collections` as the internal many-to-many festival tag. A database trigger permits a private list association only while its festival hub is Draft; owner loaders and management UI retain those associations for planning, while public loaders keep filtering to public lists and reviewed sessions. The authenticated owner workflow creates a Draft NFF27 hub, 24 private lists, and 24 held session records linked one-to-one with those lists.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase Postgres/RLS, Node test runner, disposable PGlite.

**Spec:** `docs/superpowers/specs/2026-11-16-nff27-draft-festival-tag-design.md`

## Global Constraints

- Use the existing `festival_collections` relationship; do not add a duplicate list-tag schema.
- A Draft hub may use private or public lists; Published and Archived hubs require public lists.
- Public festival routes continue to return only public lists and sessions with `needs_review = false`.
- Festival mode remains Off and the NFF27 hub remains Draft.
- Create NFF27 content only through the authenticated owner UI; no direct production SQL writes.
- The supplied 2026 programme is a draft source only: create no 2027 date, time or venue values, and keep every seeded session held for review.

## Review Focus

- A private list attached to a Draft hub must be rejected when attaching it to a Published or Archived hub; Task 1 PGlite test pins both rejection paths.
- A public list attached to any lifecycle must remain valid; Task 1 PGlite test pins the allowed path.
- An owner must see private tagged lists in Draft management; Task 2 loader test checks its `visibility` query is not restricted to public.
- An anonymous or signed-in non-owner visitor must never see a private associated list; Task 2 retains the public-loader assertion.
- A held NFF27 session must remain visible to the owner but absent from the public schedule; Task 2 component and loader tests pin the split.

---

## File structure

- `supabase/migrations/<timestamp>_allow_private_draft_festival_lists.sql` — trigger-based lifecycle/visibility guard for `festival_collections`.
- `tests/integration/festival-private-draft-lists.mjs` — disposable PGlite proof of the guard's accepted and rejected relationships.
- `lib/actions/festivals.ts` — owner action accepts the lifecycle-allowed relationship and returns a specific validation message for a rejected attachment.
- `lib/loaders/festivals.ts` — owner loader returns private Draft associations; public loader stays restricted to public data.
- `components/dev/FestivalManager.tsx` — distinguishes Draft private repertoire, exposes the session-to-list link, and labels held content in the owner release preview.
- `tests/festival-dev-management.test.ts` — action, loader and management-surface regression tests.
- `docs/superpowers/specs/2026-11-16-nff27-draft-festival-tag-design.md` — approved product design and NFF27 source list.

### Task 1: Enforce lifecycle-aware internal festival tagging

**Files:**
- Create: `supabase/migrations/<timestamp>_allow_private_draft_festival_lists.sql`
- Create: `tests/integration/festival-private-draft-lists.mjs`
- Modify: `lib/actions/festivals.ts`
- Test: `tests/festival-dev-management.test.ts`

**Interfaces:**
- Consumes: `festival_collections(festival_id, learning_list_id)`, `festival_hubs(lifecycle)`, and `learning_lists(visibility)`.
- Produces: `validate_festival_collection_list_visibility()` trigger function; `upsertFestivalCollection(values)` accepts a private list only for a Draft hub.

- [ ] **Step 1: Write failing lifecycle tests**

Add a PGlite test that creates Draft, Published and Archived hubs with private and public lists. Assert that a private list attaches only to Draft, while a public list attaches to all three. Add an action test expecting the exact `festival_collection_requires_public_list` user-facing state for a non-Draft private attachment.

- [ ] **Step 2: Run the focused tests to verify they fail**

Run: `node --experimental-strip-types --test tests/festival-dev-management.test.ts`

Expected: FAIL because the action still filters every list to `visibility = public` and no lifecycle trigger exists.

- [ ] **Step 3: Create the migration using `supabase migration new`**

Implement `validate_festival_collection_list_visibility()` as a `BEFORE INSERT OR UPDATE OF festival_id, learning_list_id` trigger. It reads the referenced hub lifecycle and list visibility, raises a check-style error when either reference is unavailable or the list is private outside Draft, updates the migration's function permissions consistently with the existing festival trigger functions, and never changes public read policy.

- [ ] **Step 4: Update `upsertFestivalCollection(values)` in `lib/actions/festivals.ts`**

Read the target list's visibility and the target hub lifecycle for a clear preflight error, then rely on the trigger as the database backstop. Keep the owner gate, upsert key, revalidation and public-list behavior intact.

- [ ] **Step 5: Run focused tests to verify they pass**

Run: `node --experimental-strip-types --test tests/festival-dev-management.test.ts`

Expected: PASS.

- [ ] **Step 6: Run the disposable database test**

Run: `PGLITE_MODULE=<resolved PGlite entrypoint> node tests/integration/festival-private-draft-lists.mjs`

Expected: PASS, with no remote project connection or production write.

### Task 2: Show the complete Draft release set to the owner without changing public output

**Files:**
- Modify: `lib/loaders/festivals.ts`
- Modify: `components/dev/FestivalManager.tsx`
- Modify: `tests/festival-dev-management.test.ts`
- Test: `tests/festival-public-hub.test.ts`, `tests/festival-session-schedule.test.ts`

**Interfaces:**
- Consumes: owner-visible `festival_collections` containing `learning_lists.visibility` and `FestivalSessionCollection` links.
- Produces: `loadFestivalOwnerFoundation()` returns private Draft collections, and `OwnerPreview` identifies each linked list and whether it can currently release.

- [ ] **Step 1: Write failing owner/public separation tests**

Change the owner loader expectation to require a bounded list query with `id,name,visibility` but no owner-only `.eq("visibility", "public")` filter. Keep the public loader test requiring public visibility. Add source-level assertions that Draft private lists are labelled and owner preview prints the associated list name for each held session.

- [ ] **Step 2: Run focused tests to verify they fail**

Run: `node --experimental-strip-types --test tests/festival-dev-management.test.ts tests/festival-public-hub.test.ts tests/festival-session-schedule.test.ts`

Expected: FAIL because owner management still hides private associations and preview has no association detail.

- [ ] **Step 3: Update owner-only loader and management UI**

In `loadFestivalOwnerFoundation()`, load owner-visible list visibility without filtering associations to public and pass `visibility` through the option and association types. In `FestivalManager`, make private list status explicit, allow available private lists only when the selected hub is Draft, and render every session's linked list title plus a `Held for review`/`Ready to release` state. Do not alter public loaders or public components.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `node --experimental-strip-types --test tests/festival-dev-management.test.ts tests/festival-public-hub.test.ts tests/festival-session-schedule.test.ts`

Expected: PASS.

- [ ] **Step 5: Run type and style checks**

Run: `npx eslint lib/actions/festivals.ts lib/loaders/festivals.ts components/dev/FestivalManager.tsx tests/festival-dev-management.test.ts tests/festival-public-hub.test.ts tests/festival-session-schedule.test.ts && npx tsc --noEmit`

Expected: both commands exit 0.

### Task 3: Seed the authenticated NFF27 release-preparation workspace

**Files:**
- No code files; create authenticated application records through `/dev/festivals` and `/learning-lists`.

**Interfaces:**
- Consumes: the Draft-only private association capability from Tasks 1–2 and the 24 exact list names in the approved spec.
- Produces: one Draft `National Folk Festival 2027` hub, 24 private empty learning lists, 24 held session records, and 24 one-to-one festival-list/session-list links.

- [ ] **Step 1: Confirm the deployed app contains the verified changes**

Use the app's authenticated management view. Do not seed against a deployment whose code predates Tasks 1–2.

- [ ] **Step 2: Create the Draft hub**

Create `National Folk Festival 2027` with slug `national-folk-festival-2027`, timezone `Australia/Melbourne`, no public programme URL, and Festival mode Off.

- [ ] **Step 3: Create the 24 private empty lists**

Use the exact `NFF27 — …` titles from the spec. Give each list the standard private draft description: `Draft NFF27 repertoire list. Session wording follows the supplied 2026 programme; confirm the 2027 programme and leader before making this public.`

- [ ] **Step 4: Tag and link the release-preview entries**

Attach every private list to the Draft hub. Create one held session draft with the programme wording and no date/time/venue; link it to exactly its matching list.

- [ ] **Step 5: Verify the owner preview**

Confirm it shows 24 private repertoire lists and 24 held sessions with their matching list links. Confirm Festival mode remains Off and the hub lifecycle remains Draft.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations lib/actions/festivals.ts lib/loaders/festivals.ts components/dev/FestivalManager.tsx tests docs/superpowers
git commit -m "feat: support private draft festival collections"
```

## Self-review

- **Spec coverage:** Tasks 1–2 implement the non-duplicated internal tag, Draft-only privacy, owner preview and unchanged public boundary. Task 3 creates the hub, exact lists, held sessions and links.
- **Step scan:** Every task starts with a failing test, names the affected interface, implements one layer, and ends in a relevant pass/failure check.
- **Type consistency:** Owner collection and option visibility values expand from `public` to `private | public`; no public loader type changes.
- **Review Focus:** Every listed lifecycle, owner/privacy, public-boundary and held-session condition is assigned to an explicit test task.
- **Proportion:** The plan specifies interfaces and acceptance rather than code bodies; the migration and UI implementation choices remain idiomatic to the existing project.

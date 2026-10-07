# Festival Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Festival mode simple in Developer tools and give each festival a clear, tabbed preparation workspace.

**Architecture:** Keep the existing database and owner-only actions. Add a small owner launch loader and mode action for the Dev switch. Recompose the existing festival manager into URL-backed sections and separate lifecycle actions from metadata. Derive checklist labels from saved records.

**Tech Stack:** Next.js App Router, React, TypeScript, Supabase, node:test.

**Spec:** `docs/superpowers/specs/2026-10-08-festival-management-design.md`

## Global Constraints

- Festival mode controls Home promotion; publication and direct links follow their existing lifecycle rules.
- Owner-only server and database permissions remain enforced.
- Public lists remain the source of tune membership.
- No real festival is published or activated during development.

## Review Focus

- A stale Dev switch must preserve the current selected festival.
- Selecting another festival must not silently switch a live Home promotion.
- Review-held sessions must be counted and remain hidden publicly.
- A draft must remain private even if selected while mode is off.
- An empty published hub must be warned about before confirmation.

---

### Task 1: Global Festival mode switch

**Files:** `app/dev/page.tsx`, `components/dev/FestivalModeControl.tsx`, `lib/loaders/festivals.ts`, `lib/actions/festivals.ts`, `tests/festival-dev-management.test.ts`.

- [x] Add a failing action test proving mode changes only `mode_enabled`.
- [x] Add owner-only launch loader and mode action; make the test pass.
- [x] Render the switch and selected festival in Dev; verify owner-only rendering and no-selection handling in code and tests.

### Task 2: Festival workspace navigation

**Files:** `app/dev/festivals/page.tsx`, `components/dev/FestivalManager.tsx`, `tests/festival-dev-management.test.ts`.

- [x] Add a failing test for URL selection and fallback behavior.
- [x] Implement the URL-backed chooser and four tabs; retain all current forms.
- [x] Verify deep-link and empty-state behavior in code and tests. Responsive visual acceptance remains with the owner.

### Task 3: Review and lifecycle

**Files:** `components/dev/FestivalManager.tsx`, `lib/actions/festivals.ts`, `lib/festivals/setup.ts`, `tests/festival-dev-management.test.ts`.

- [x] Add failing tests for checklist facts and lifecycle/selection actions.
- [x] Move lifecycle out of Details into confirmed Review actions; add preview and setup status.
- [x] Make session rows expandable and identify held entries.
- [x] Verify targeted tests, lint, typecheck, full test suite and production build.

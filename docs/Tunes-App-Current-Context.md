# Tunes App Current Context

## 1. Purpose of this file

This file gives Codex and future AI coding sessions a stable project context so design, architecture, naming, and product decisions do not drift across prompts. It is internal repo documentation, not user-facing app content.

Update this file after major architecture, navigation, product-language, mobile-layout, design-system, or schema changes.

## 2. Core product model

- Tunes are canonical records in the shared tune library.
- Lists are neutral user-owned organisational containers.
- Lists do not determine whether a tune is known or in practice.
- Practice is active spaced-repetition/review state.
- Known is a separate user-to-tune state.
- A tune should not be both Known and In practice for the same user.
- Starting Practice is deliberate.
- Adding to a list does not start Practice.
- Public/shared discovery should normally feed private lists first, not bypass the deliberate practice layer.
- Comparison is based on real repertoire state: known tunes plus active practice tunes, not list membership alone.

## 3. Current implementation source of truth

The live repo is the implementation source of truth. Older docs remain useful for product intent and architectural reasoning, but they may use older names. If old docs mention names that differ from current files, translate the intent to current names instead of launching broad renames.

Naming map:

- `LearningListsSection` -> `ListsSection`
- `AddToLearningListSection` -> `AddToListSection`
- Create Learning List -> Create List
- Already Learning / active learning -> Already in practice / practice state
- Start Learning -> Start Practice
- Visible practice language should use Stage, Start Practice, Already in practice.
- Internal data names such as `learning_lists`, `learningLists`, and `learning_list_items` are allowed to remain because they are stable data-layer names.

## 4. Current navigation structure

Current shell files:

- `app/layout.tsx` loads nav context and renders `components/layout/AppHeader.tsx`.
- `AppHeader` renders `DesktopNav` and `MobileNav`.
- Shared nav definitions live in `components/layout/navItems.ts`.

Desktop nav for signed-in users:

- Home (`/`)
- Practice (`/review`, with overdue practice badge)
- Tunes (`/library`)
- Lists dropdown:
  - My Lists (`/learning-lists`)
  - Public Lists (`/public-lists`)
- Social dropdown:
  - Friends (`/friends`)
  - Compare (`/compare`)
  - Setlists (`/setlists`)
  - Badges (`/badges`)
  - Trends (`/trends`)
  - Inbox (`/inbox`, with unread badge)
- Moderator (`/moderator`) only when allowed
- Dev (`/dev`) only when allowed
- Profile (`/dashboard`)
- Logout

Desktop nav for signed-out users shows Login only.

Mobile nav for signed-in users:

- Primary visible row: Home, Practice, Tunes, Lists, Social, More.
- Lists opens an inline panel with My Lists and Public Lists.
- Social opens an inline panel with Friends, Compare, Setlists, Badges, Trends, and Inbox. Inbox carries the unread badge.
- More opens an inline panel with Profile, optional Moderator, optional Dev, and Logout. More carries the moderation badge when present.
- Signed-out users do not get the mobile nav row.

Navigation is structurally important. Do not casually add, remove, or move top-level nav items during unrelated feature work. If a feature needs nav changes, document the intended IA change first.

## 5. Page meaning / information architecture

- Home (`/`): overview and next-action surface, not a builder console. It summarises known tunes, practice, due work, attention, lists, getting started state, streaks, friend activity, and badges where enabled.
- Practice (`/review`): due reviews, catch-up work, review cards, streaks, backlog, active practice, and Practice Diary/foci entry points. Diary lives under `/review/diary`; foci under `/review/foci`.
- Tunes (`/library`): canonical tune browsing, searching, filtering, tune creation/moderation, tune-level actions, known/practice state, add-to-list, comments, lore, and reference media. Tune detail lives under `/library/[id]`; known/practice filtered surfaces live under `/library/known` and `/library/practice`.
- Lists (`/learning-lists`): user-owned tune collections, list search/filtering, My Tunes, learning queue, unlisted practice/known cleanup, create/edit lists, and list membership management. Current route names still use `learning-lists`.
- Public Lists (`/public-lists`): shared/public list discovery before private organisation or practice decisions.
- Friends (`/friends`): friend search, requests, current friends, and relevant friend activity.
- Compare (`/compare`): repertoire alignment using known and optionally practice state, with friend/privacy gates.
- Setlists (`/setlists`): collaborative performance or rehearsal setlists, coverage, invites, charts, keys, and tune readiness.
- Badges (`/badges`): community/user-awarded recognition and badge browsing/creation.
- Trends (`/trends`): public/community repertoire patterns by style plus friend trend summaries when signed in.
- Inbox (`/inbox`): notifications and direct messages.
- Profile (`/dashboard`): private profile/account, instruments, visibility, privacy, compare discoverability, and diary preference controls. Public profile surfaces live under `/users/[username]`.
- Moderator and Dev are role-gated operational surfaces.

Route names may not perfectly match user-facing labels. Labels and user mental model matter more than historical route names.

## 6. Core architecture boundaries

- `app/` routes compose pages.
- `lib/loaders/*` handles server-side reads.
- `lib/actions/*` handles server actions and writes.
- `lib/services/*` holds reusable domain/business logic where needed.
- `components/*` handles shared presentation.
- Client components handle browser interactivity, pending navigation, modals, sheets, and local UI state.
- Shared types belong in `lib/types.ts` or `lib/types/*` when reused.
- Review/date logic must remain centralised, especially in `lib/review.ts`.

Broad feature work should be implemented as coherent vertical slices: route composition, loader reads, actions/writes, shared types, UI, feedback states, and tests/checks where relevant.

## 7. Date and review logic rule

Date logic is core product logic, not incidental JavaScript behaviour.

Due-state and scheduling code must:

- use explicit Australia/Melbourne calendar-date semantics
- normalise stored database date/timestamp values before comparison
- avoid parsing locale-formatted strings back into `Date` objects
- use stable date-only comparisons wherever possible
- test today, overdue, and future-due cases locally and deployed when date logic changes

Do not introduce raw timezone-dependent JavaScript date comparisons in review, diary, backlog, due, streak, or schedule logic.

## 8. Interaction feedback standard

All user-triggered actions need immediate visual feedback.

Rules:

- server action forms should use the existing `SubmitButton` component where appropriate
- provide `label` and `pendingLabel`
- disable during pending submission
- prevent duplicate submissions
- route-changing/client actions should use the established pending/navigation pattern such as `PendingLinkButton` or `PendingNavLink`
- success and error states should be visible after completion
- do not add ad hoc loading behaviour if an existing app pattern exists

## 9. Mobile design rules

- Mobile should not be a shrunken desktop page.
- Avoid boxes inside boxes.
- Prefer headings, rows, dividers, and one clear surface level on dense mobile pages.
- Avoid inert explanatory text on repeated-use mobile surfaces.
- Use `ResponsiveModal` or existing sheet/full-screen patterns for long selectors, filters, and forms.
- Filters and modals must have visible close controls and safe internal scrolling.
- Touch targets must be usable.
- Do not hide core functionality on mobile.
- Keep desktop layout stable unless the pass explicitly includes desktop redesign.

## 10. Visual design system

Current tokens live in `app/globals.css` and are exposed through Tailwind theme variables.

- pale sage background: `--background: #f3f7ea`
- soft sage card surfaces: `--card: #e4ead8`, `--card-strong: #d7e0c5`
- muted olive borders: `--border: #b0bc8c`
- darker sage primary buttons: `--primary: #7b8a50`, `--primary-hover: #6f7e48`
- deep olive text: `--foreground: #20271c`, `--muted-foreground: #596650`
- restrained red-brown destructive actions: `--destructive: #7a4b45`
- accent/success/warning use sage/olive family tokens
- use semantic colour tokens rather than scattered raw hex values
- serif headings are reserved for major page titles/mastheads
- compact uppercase sans headings are used for dashboard/card sections

## 11. Important feature rules from addenda

Add to List:

- organisational action only
- does not create `user_pieces`
- does not affect review/streak/backlog
- should prevent duplicate list membership
- should reuse shared add-to-list UI where possible

Remove Tune vs Remove from List:

- Remove Tune means remove the user's relationship to the tune globally from their app state
- Remove from List means remove only that list membership
- Do not confuse these scopes

Reference media:

- `reference_url` belongs to the canonical tune record
- it may appear in Tunes and Practice
- opening reference media does not count as review completion
- it does not affect stage, due date, streak, or backlog

Practice Diary:

- all meaningful practice can be logged
- only deliberate review-quality recall advances spaced repetition
- Review Events and Practice Events are different
- Diary/foci/targets should enrich practice context without taking over review scheduling

Foci:

- foci guide what the user is paying attention to
- categories are analytical tags
- foci are active musical projects
- attaching a note to a focus should not affect review scheduling

Badges:

- badges are user-awarded recognition objects, not only automatic app achievements
- badge language should use "awarded by"
- badges are not limited to friends unless a specific badge scope says so

Profiles:

- profile supports identity, instruments, privacy/visibility, public profile surfaces, compare/social discoverability
- avoid turning profile into a feed unless deliberately scoped later

## 12. Codex working rules for this repo

Before editing:

- inspect the current implementation
- identify affected files
- preserve existing architecture boundaries
- use the live repo as source of truth

During implementation:

- make the smallest coherent vertical-slice change
- do not do unrelated refactors
- do not rename routes/components unless required
- reuse existing patterns and shared components
- preserve desktop/mobile expectations
- include pending/success/error feedback where actions are added or changed

After implementation:

- run `npm run build`
- fix build errors before stopping
- report changed files, behaviour changed, assumptions made, manual tests needed, and anything deliberately left out of scope

## 13. Maintenance note

This file is a snapshot, not sacred text. Update it after major implementation changes, especially:

- navigation changes
- schema/model changes
- app-wide design-system changes
- mobile architecture changes
- naming convention changes
- new feature domains such as diary, badges, profiles, setlists, or social flows

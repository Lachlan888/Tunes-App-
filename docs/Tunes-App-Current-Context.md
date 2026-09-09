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

The local repository is the implementation source of truth, including current unfinished work. Read `Prompt Runner State.md` first for progress, recovery, checks and the next action. This context describes established architecture; a recorded checkpoint is not proof of a successful deployment. Older docs remain useful for product intent and architectural reasoning, but they may use older names. Translate older names to current code rather than launching broad renames.

Prompt 14 Setlists is currently an interrupted partial implementation. Preserve its files and follow the live ledger to complete integration; do not treat the new Read/Manage/Performance helpers as a finished route. Earlier completed-prompt results are retained in the historical archive linked from the ledger.

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

- `app/layout.tsx` loads navigation context and renders `components/layout/AppShell.tsx`.
- `AppShell` composes the phone top bar, desktop rail, phone Navigation Dock, account menu, and the contextual Session Dock.
- Shared route-to-destination definitions live in `components/layout/navItems.ts`.

Signed-in consumer navigation has exactly six visible, first-class destinations at phone, tablet, and desktop widths:

- Home (`/`)
- Practice (`/review`, with overdue practice badge)
- Tunes (`/library`)
- Lists (`/learning-lists`)
- Social (`/friends`, with combined social/inbox attention badge)
- Compare (`/compare`)

Social and Compare are deliberately separate destinations with distinct active states. Compare must not be moved back under Tunes, the account menu, or a generic Social grouping. Secondary destinations such as Public Lists, Setlists, Badges, Trends, Inbox, Account & settings, Metronome, Help & feedback, and role-gated Moderator/Developer tools live in the account menu or contextual surfaces. Signed-out and internal shells do not inherit the consumer rail/dock.

Contextual control layer:

- `components/session-dock/SessionDockProvider.tsx` owns one active Session Dock registration and renders the adaptive dock outside route content. Route features publish typed models rather than adding route checks to `AppShell`.
- The shared model in `components/session-dock/sessionDockModel.ts` supports Tune Detail, focused Practice, Reference Media, catalogue selection, list selection and setlist Performance contexts through one primary/secondary action, progress/status, collapsed/expanded content and persistence contract.
- The Session Dock sits above the phone Navigation Dock and becomes a bottom contextual toolbar on wider screens. The two layers share `--navigation-dock-space` and `--session-dock-space`; an expanded Session Dock makes the collapsed dock and phone navigation inert and invisible.
- Tune identity is URL-addressed. Practice queue position, reference playhead/loop/speed/section and setlist position use versioned `sessionStorage`; reference source and setlist performance item are reflected in safe URL parameters. Private selections must not be placed in URLs.
- Metronome and Feedback no longer render as floating launchers on signed-in pages. Help & feedback remains in the account menu. The metronome is available from contextual Practice, Reference Media and setlist docks, with the account menu as the secondary entry point.
- The development design-system page contains an interactive five-context Session Dock showcase for phone and desktop verification.

Navigation is structurally important. Do not casually add, remove, or move top-level nav items during unrelated feature work. If a feature needs nav changes, document the intended IA change first.

## 5. Page meaning / information architecture

- Home (`/`): overview and next-action surface, not a builder console. It summarises known tunes, practice, due work, attention, lists, getting started state, streaks, friend activity, and badges where enabled. Home Social reuses the same compact activity-feed primitive as Friends and limits the summary to five meaningful events.
- Practice (`/review`): a compact lane chooser puts the next useful due-today or catch-up session in the first viewport, followed by active practice, Practice Diary/foci, and supporting streak information. Explicit `?session=due-today` and `?session=catch-up` URLs enter Focused Practice, which removes the ordinary app chrome, keeps one tune and its Stage/due/reference context prominent, and publishes Rough/Shaky/Solid, progress, reference, metronome, and End Session through the persistent Session Dock. Ratings have a brief pre-save Undo window; once saved they use the existing idempotent review function and Stage rules, then advance without skipping. Session position and display-only results resume from date-and-lane-scoped session storage, safely clamp when the server queue changes, and feed an end summary with rating distribution, Stage changes, and one next suggestion. Diary lives under `/review/diary`; foci under `/review/foci`.
- Tunes (`/library`): canonical tune browsing, searching, filtering, tune creation/moderation, tune-level actions, known/practice state, add-to-list, comments, lore, and reference media. The catalogue defaults to dense `TuneRow` results beneath a sticky search/filter/sort/select toolbar; filters are drafted in one bounded sheet and only applied to the URL on confirmation. Select mode keeps a private, session-scoped multi-tune selection and publishes bulk List actions through the Session Dock. Creation begins with tune identity and duplicate suggestions before optional detail fields. Tune detail lives under `/library/[id]` and is a URL-addressable hub with exactly three stable views: `practice` (default), `reference`, and `about`. The compact shared identity header carries one useful alias, type/style/key, source confidence and personal state. Practice owns Stage/schedule/result/history/notes, Reference previews the strongest saved source and sends focused playback to `/library/[id]/reference-media`, and About owns provenance, aliases, related-tune notes, secondary metadata and attributed community information. Infrequent organisation, correction, duplicate-report, moderator-edit and delete actions live behind Manage/Page Options; the Session Dock carries the current tune plus Practice, Reference and overflow actions without recreating page content. Known/practice filtered surfaces live under `/library/known` and `/library/practice` and reuse bounded dense rows with collection-specific grouping.
- Lists (`/learning-lists`): a URL-addressed count strip separates My Lists, Learning Queue, Unsorted and Saved/Shared. Growing collections render at most 20 rows per page and Queue/Unsorted support search and grouping. Queue select mode is private and bounded to 50 tunes, with owner-validated bulk Start Practice through the Session Dock. Owned list detail has a calm Reader and a separate Manage mode; Manage owns metadata/sharing, drag plus keyboard reordering with optimistic rollback, membership removal and deletion. Reader can start a real list-scoped Practice session from tunes already in active Practice. Current route names still use `learning-lists`.
- Public Lists (`/public-lists`): paginated editorial discovery cards foreground curator, premise, tune count and style before private organisation or practice decisions. Detail collections are bounded, and missing/removed/private links recover with neutral privacy wording, search and Back to Public Lists.
- Friends (`/friends`): friend search, requests, current friends, and a compact meaningful activity feed. Actor, musical action, context, time and exact reaction/comment counts stay visible; reactions, replies and the comment form mount only after opening a discussion. Searches and stale/duplicate request outcomes use neutral privacy-safe recovery wording.
- Compare (`/compare`): a first-class outcome-led rehearsal tool. A comparison first states how many tunes the selected musicians can play together now, then separates Solid/Known overlap, shared-but-building tunes and two-person teaching possibilities without scoring people. Known plus active Practice is the explicit default; full overlap uses URL-addressed group/search/facet/page state and a bounded 20-row `TuneRow` page. A six-tune suggestion can be reordered or adjusted and saved only after confirmation as an owner-private setlist; selected musicians are not silently added.
- Setlists (`/setlists`): collaborative performance or rehearsal setlists, coverage, invites, charts, keys, and tune readiness. Setlist detail publishes a lightweight Performance context with current tune, previous/next, key, Tune Detail and metronome controls; the current item is shareable through the `performance` query parameter.
- Badges (`/badges`): community/user-awarded recognition and badge browsing/creation.
- Trends (`/trends`): compact personal practice insights and next steps with URL-addressed periods, followed by privacy-aware community/style context and bounded rankings. Style detail lives under `/trends/[style]`.
- Inbox (`/inbox`): a URL-addressed Activity/Messages surface because direct messages are a real product capability. Activity separates unread New items from bounded 20-item History pages and offers a notification-only bulk-read action. Messages uses compact conversation rows, unread markers and bounded threads (20 people, latest 10 messages each) with reply controls disclosed on expansion.
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
- Shared tune-collection contracts live in `lib/tune-collections/*`. Catalogue, Known, Practice, Learning Queue, list membership, Profile repertoire, and Compare use explicit permission adapters rather than sharing private membership shapes.
- Catalogue, Known, and Practice render stable 20-row cursor pages with a public tune ID tie-breaker. Validated search/filter/sort/cursor state stays in the URL; follow-up media, status, and list reads are limited to the current page. `CardPager` is reserved for finite sets of at most 50 items.
- Catalogue filter drafts and selection state are client-only interaction state: draft checkboxes must not refetch, applied filters remain URL-addressable for back/forward navigation, and selected tune IDs may persist only in session storage. All bulk List mutations revalidate authentication, List ownership, tune IDs, deduplication, and input bounds on the server.
- Tune Detail keeps identity, media links and personal state stable across its three views, while loading review history only for Practice and community discussion/profile data only for About. Legacy `overview` URLs resolve to Practice and legacy `community` URLs resolve to About.
- Focused Practice deliberately does not offer a post-save database rollback. Its visible Undo cancels the pending rating before the server action starts, so review history, Stage, due date, streaks, and queue state remain internally consistent. A failed network/server save keeps the tune available and presents a retryable error.
- Home and Friends share `components/activity/SocialActivityFeed.tsx`; server loaders prioritise and deduplicate musically meaningful events before applying a 25-item bound. Activity replies are capped at 200 per feed load. The `user_activity_events` read policy allows only the owner or an accepted connection; reactions/replies inherit the same visibility boundary, notifications remain recipient-only, and direct messages remain participant-only.
- Compare outcome logic lives in `lib/compare-outcomes.ts`; loaders keep repertoire reads bounded and server actions revalidate authentication, comparison permission, selected tune IDs and ownership before creating a private setlist. Compare-in-person uses a 256-bit capability token stored only as a hash, a ten-minute pending invitation, a maximum of eight creations per account per hour, explicit acceptance before repertoire is revealed, session-storage reconnect, visible cancellation and safe invalid/expired recovery. `user_known_pieces` and `user_pieces` SELECT policies require owner access or explicit profile/friend/Compare consent rather than blanket authenticated access.

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
- Dense catalogue controls should remain compact at phone widths: one search row, a compact control row, horizontally scrollable applied chips, and a sticky result/action footer inside long filter sheets.
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
- `/library/[id]/reference-media` is a dedicated Reference Mode with URL-addressed recording selection, a persistent player and Session Dock, phone Media/Sections/Practice views, and a two-column desktop workspace
- saved passages are owner-scoped to a recording; selecting one restores its loop and speed, and deleting one offers an immediate Undo
- starting passage practice creates a focused looping context but does not count as review completion or affect Stage, due date, streak, or backlog
- unavailable external providers and tunes with no media must show honest fallback/empty states and must not render fake playback controls

Practice Diary:

- all meaningful practice can be logged
- only deliberate review-quality recall advances spaced repetition
- Review Events and Practice Events are different
- Diary/foci/targets should enrich practice context without taking over review scheduling
- Diary uses one URL-addressed Day/Week/Month control with one previous/current/next period header; Week and Month detail tabs are also URL-addressed and restore through browser history
- Week answers what was practised, what improved and what needs attention; Month uses an accessible musical calendar that exposes both volume and Rough/Shaky/Solid outcomes in text as well as colour
- Day is a readable chronology with explicit save status and unsaved-change protection instead of a stack of large summary cards

Foci:

- foci guide what the user is paying attention to
- categories are analytical tags
- foci are active musical projects
- attaching a note to a focus should not affect review scheduling
- user-facing copy is “Focus areas”; internal database and type names may remain `foci`
- active focus areas are first-class practice-session contexts at `/review?session=focus&focus_id=...`, scoped to linked tunes that are currently in Practice
- focus detail is organised around intent, linked tunes, evidence and next review, with a prominent “Practise this focus” action

Trends:

- `/trends` is an actionable personal practice overview, not a dashboard of large count cards
- 4/8/12-week period controls live in the URL and drive server-side weekly aggregates for practice volume, reviews, active days and outcomes
- responsive charts always include exact values, a plain-language takeaway and a text/table equivalent; colour is never the only encoding
- zero-value sections remain hidden and a single constructive “Not enough data yet” state points to Practice
- overdue tunes link directly to catch-up Practice, while repertoire gaps link to filtered catalogue discovery
- style detail compares the signed-in user’s Known/Practice membership with the visible catalogue and privacy-allowed community memberships, with explicit denominators and bounded six-row rankings
- Trends loaders bound catalogue, membership, friend, public-list and event reads and do not ship raw practice histories to the client

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
- when implementation creates a Supabase migration, apply it to the linked Supabase project in the same run and verify the remote migration/schema state; do not leave required migrations local-only
- report changed files, behaviour changed, assumptions made, manual tests needed, and anything deliberately left out of scope

## 13. Maintenance note

This file is a snapshot, not sacred text. Update it after major implementation changes, especially:

- navigation changes
- schema/model changes
- app-wide design-system changes
- mobile architecture changes
- naming convention changes
- new feature domains such as diary, badges, profiles, setlists, or social flows

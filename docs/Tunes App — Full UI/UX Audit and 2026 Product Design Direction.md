# Tunes App — Full UI/UX Audit and 2026 Product Design Direction

**Audit date:** 2 September 2026

**Production app:** https://tunes-app-three.vercel.app

**Implementation reviewed:** production commit `b7addce4778ffd0daf5a9adae0a92fe8f88a4581`

**Phone test size:** 390 × 844 CSS pixels

## 1. Executive judgement

Tunes already has the substance of a real product. It is not merely a tune database: it combines a personal tunebook, a practice system, reference media, lists and setlists, a diary, progress history, repertoire comparison and a small traditional-music community. The strongest design direction is therefore not “a green music app” and not “an iOS imitation.” It is **the living tunebook**: a contemporary working tool that feels like a musician's field notebook brought to life.

The current interface is calm, coherent and often impressively thorough, but four structural problems stop the app from feeling as effective as its feature set deserves:

1. **The phone experience is too tall and too card-heavy.** Several important phone pages are tens of thousands of pixels long. Known Tunes reached roughly 27,000 px, Learning Queue roughly 36,000 px, and profiles roughly 28,000–32,000 px.
2. **The navigation and permanent tools compete with the work.** Six small text destinations occupy the phone header, while Metronome and Feedback float over every signed-in route whether relevant or not.
3. **Green performs too many unrelated jobs.** Brand, primary action, selection, success, Known status, Stage, practice quality, warnings, borders and navigation are all expressed with nearby olive tones. This makes the app feel monotonous and weakens meaning.
4. **The code often renders a desktop-sized information set through a phone-shaped window.** The most important example is the catalogue: desktop receives a normal 20-item page, while phone loads every matching tune and places the entire result in a one-card pager. That is a product and performance problem, not just a styling problem.

The next version should preserve the warmth, gentle humour and community character while making the phone feel fast, reachable and task-led. The key change is a small, adaptive control layer floating above mostly opaque content: a bottom Navigation Dock for destinations and a contextual Session Dock for the tune, practice or media task at hand. It borrows the underlying logic of Apple's current design language—content is primary, controls are compact and adaptive, menus originate from their controls—without copying Liquid Glass as a visual costume.

## 2. What the product is really for

The app serves six connected jobs:

- **Remember my repertoire:** what I know, what I am learning and how stable each tune feels.
- **Decide what to practise now:** surface due tunes and provide a quick, low-friction practice loop.
- **Learn in context:** use recordings, saved passages, speed controls, loops, sections and notes.
- **Organise tunes for real life:** personal lists, shared lists, learning queues and setlists.
- **Play with other people:** compare repertoires, find shared tunes and turn overlap into a session.
- **See a musical life taking shape:** diary, focus areas, trends, badges, profiles and community activity.

That means Tunes should optimise for **recognition, resumption and readiness**, not browsing alone. A successful session is often only a few seconds long: open the app, see the next useful action, practise a tune, record Rough/Shaky/Solid, and leave. At other times the same person wants a deep reference workspace or a public catalogue. The design must support both without making every screen equally dense.

I would position the product internally as:

> **Tunes is a living tunebook for remembering, practising and sharing traditional music.**

That phrase should guide every decision. If an interface treatment feels clever but does not help a musician recognise, resume or become ready to play, it does not earn space.

## 3. Translating 2026 platform design into something native to Tunes

Apple's 2026 design principles emphasise purpose, agency, familiarity, flexibility, simplicity, craft and delight. Its current platform direction also continues to refine Liquid Glass for readability, accessibility and adaptation across screen sizes. The important lesson is not translucency itself. It is that **content and functional controls are separate layers**, and that the control layer should remain compact, responsive and legible.

For Tunes, apply that lesson as follows:

- Keep tune content, lists, notes and diary entries on opaque paper-like surfaces. Long text and dense metadata should never sit on glass.
- Allow only navigation, playback, practice ratings and transient menus to float above content.
- Let a button visibly become the sheet or menu it opens. For example, Filters should expand from the Filter control; the tune's Session Dock should expand into media controls or practice actions.
- Use one floating layer at a time. When a sheet opens, retire or merge the controls underneath it instead of stacking floating pills.
- Minimise controls while scrolling downward and restore them on upward scroll or when the person reaches the end.
- Adapt by context. A phone wants quick touch actions; desktop wants overview, comparison and simultaneous panels.

This follows current Apple thinking without pretending a web app is a native iOS system app. The visual character should remain Tunes: parchment, ink, timber, brass, river, moss, clay and social plum.

Primary platform references:

- [Apple's 2026 design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)
- [WWDC26 Platforms State of the Union](https://developer.apple.com/videos/play/wwdc2026/102/)
- [WWDC26 Principles of great design](https://developer.apple.com/videos/play/wwdc2026/250/)
- [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
- [Build a UIKit app with the new design](https://developer.apple.com/videos/play/wwdc2025/284/)
- [Build a SwiftUI app with the new design](https://developer.apple.com/videos/play/wwdc2025/323/)

## 4. The proposed experience model

### 4.1 Navigation Dock

Replace the six small links at the top of the phone with five stable bottom destinations:

1. Home
2. Practice
3. Tunes
4. Lists
5. Social

Use an icon and short label for every destination. The selected destination receives a compact filled or tinted island, but the entire dock remains one quiet control surface. Account, settings, help, moderator and development tools move behind the avatar in the top bar. On scroll, the dock can reduce in height while retaining the selected icon and label.

This immediately improves reachability, restores vertical space, makes the information architecture learnable and removes the current More panel that pushes the page downward.

### 4.2 Session Dock

The distinctive Tunes component should be an adaptive **Session Dock**. It appears only when a task benefits from persistent controls.

- **Catalogue:** selection count, Add to List and clear selection.
- **Tune detail:** current tune, Start Practice, play/reference action and overflow.
- **Focused Practice:** Stage/progress, Rough, Shaky, Solid, Next.
- **Reference Media:** current source, play/pause, loop, speed and section.
- **Setlist performance:** current tune, next tune, key and large next/previous actions.

It should sit above the Navigation Dock, visually related but clearly contextual. A small tap opens a medium sheet; a drag or explicit expand action opens the full workspace. This is the “floating bubble” idea made native to the product: it is not decoration, it is the musician's active workbench.

### 4.3 Focus modes

Use three intentional modes that reduce global chrome:

- **Focused Practice:** queue, tune, minimal reference, three rating actions and next.
- **Reference Mode:** video/audio, passage loop, speed, sections and notes.
- **Performance Mode:** ordered setlist, large readable tune identity, key, readiness and next tune.

People should be able to leave and return without losing the current tune, media position, loop, filter, queue position or scroll position.

### 4.4 Progressive disclosure

The current app frequently shows summary, metadata, actions and administration at the same time. The redesign should use three levels:

- **Glance:** title, key, rhythm/style, status and one next action.
- **Work:** practice/media/list tools relevant to the current goal.
- **Manage:** editing, duplicate reporting, deletion, moderator data and infrequent metadata.

This is how the app becomes simpler without becoming less capable.

## 5. A semantic but still folksy palette

The original project palette notes already imagined parchment, timber, canvas, brass and field-recording warmth. The current implementation narrowed that idea into pale green. The correct move is not to abandon green; it is to give green one honest meaning and bring the rest of the original world back.

### 5.1 Foundation colours

| Token | Hex | Job |
|---|---:|---|
| Canvas parchment | `#F4EFE4` | Main app background |
| Raised paper | `#FFFDF8` | Cards, sheets and reading surfaces |
| Soft field note | `#E9E1D3` | Grouped sections and quiet fills |
| Ink | `#25231F` | Main text and high-emphasis icons |
| Muted ink | `#675F55` | Secondary text |
| Hairline | `#D3C7B5` | Dividers and non-semantic boundaries |

### 5.2 Brand and semantic colours

| Token | Hex | Meaning |
|---|---:|---|
| Primary umber | `#5B4325` | Main action, brand emphasis, ink-like authority |
| Umber hover | `#49351D` | Pressed/hover state |
| Moss | `#68754A` | Known, retained, completed, Solid |
| River indigo | `#466A78` | Practice session, reference media, active work |
| Ochre | `#C18B32` | Due today, Stage, selected attention, Shaky |
| Rust/clay | `#A9533E` | Overdue, Rough, strong attention |
| Social plum | `#755B72` | Community, sharing, badges and cultural moments |
| Oxblood | `#8E3934` | Delete/remove only |

### 5.3 Accessibility of the palette

The current primary olive `#7B8A50` on the near-white surface is about **3.64:1**, below the 4.5:1 WCAG AA threshold for ordinary small text. The current border colour on near-white is only about **1.95:1**, so it should not be the only way an active or selected control is communicated.

The proposed dark semantic colours all pass 4.5:1 on raised paper: umber 9.08:1, moss 4.88:1, river 5.75:1, rust 5.17:1, plum 5.91:1 and oxblood 7.42:1. Ochre should use dark Ink text rather than white; that pairing reaches about 5.23:1.

Colour must still never be the only state cue. Pair it with plain language, an icon and sometimes shape:

- `Known` + check + moss
- `Stage 2 · due today` + clock + ochre
- `Rough` + uneven waveform/low bar + rust
- `Shaky` + half-stable mark + ochre
- `Solid` + check/steady mark + moss

### 5.4 Typography, icons and surfaces

- Use the system sans-serif stack for controls, lists and metadata so the app remains crisp and familiar on each platform.
- Add one warm editorial serif—used sparingly—for tune titles, section openings and badge names. It should feel like a printed tune collection, not a faux-pub menu.
- Stop putting a visible border and rounded rectangle around every grouping. Use paper surfaces, spacing and hairline dividers for ordinary lists; reserve lifted cards for a true object or decision.
- Adopt a coherent radius scale: roughly 12 px for compact controls, 18 px for cards, 24 px for sheets and a full pill only for status or a one-line control group.
- Use one consistent outline icon family. The current abundance of text pills makes hierarchy harder to scan than icon-plus-label navigation would.

### 5.5 Motion

- Standard transitions: about 180–260 ms with a restrained spring-like finish.
- Sheets should expand from their presenting control.
- Starting Practice should carry the tune title into Focused Practice rather than cutting to an unrelated page.
- The Session Dock should smoothly change content rather than appear as separate fixed widgets.
- Respect reduced-motion and reduced-transparency settings.

## 6. Full phone audit by surface

### 6.1 Global shell and navigation

**Current state:** The brand and tagline occupy the top, followed by six small text controls—Home, Practice, Tunes, Lists, Social and More. The controls are approximately 36 px high. Opening a group inserts navigation content into the document flow. Metronome and Feedback are fixed over the lower corners on every signed-in route.

**Recommendation:** Use the five-tab Navigation Dock and a compact top bar containing the current page title, contextual search/action and avatar. All important targets should be at least 44 × 44 px. Put Feedback under Help in the avatar menu and offer it contextually after meaningful actions. Put the metronome in the Session Dock on Practice, Reference Media and setlists; it can remain globally reachable through a long-press or overflow action without covering every page.

### 6.2 Home

**Routes/states reviewed:** `/` with Today, Repertoire and Social.

The phone Home switcher is already one of the app's best patterns. It gives each mode a clear job and avoids showing everything simultaneously. Make it the reference pattern for other dense sections.

- **Today:** lead with a single “Continue” object. If a practice session was interrupted, resume it. Otherwise show the most useful due tune and a small queue preview.
- **Repertoire:** show compact counts and recent changes, not a second catalogue.
- **Social:** preserve the current collapsed-comment approach; it is much better than the fully expanded Friends activity cards.
- Allow the selected Home view to persist.
- Reduce the introductory copy after the first few visits; experienced users need the next action more than an explanation.

### 6.3 Login and account settings

**Routes reviewed:** `/login`, `/dashboard`, and the `/repertoire` redirect.

The login page is visually part of the signed-in shell even when a signed-in person reaches it. Redirect signed-in people to Account or present an explicit “Switch account” state. The dashboard is a very long form on phone. Rebuild it as native-feeling grouped settings:

- Profile
- Privacy and sharing
- Practice preferences
- Notifications
- Account and security
- Moderator/developer, shown only when entitled

Each group opens a focused screen or sheet, with save state and clear success feedback. Destructive account actions belong in a separated Danger Zone.

### 6.4 Tunes catalogue

**Routes/states reviewed:** `/library`, Filters, Create Tune, Add to List, `/library/known`, `/library/practice`.

The catalogue is the most urgent mobile redesign. The phone currently uses a CardPager for the complete matching catalogue. With hundreds of tunes, one-card paging makes discovery slow and creates a large client-side result. The implementation also performs an unbounded phone query while desktop gets a normal 20-item page.

Replace this with:

- A sticky search field and compact Filter button with active-filter count.
- A dense row view by default: tune title, type/rhythm, key, provenance and personal state.
- Optional card or “browse” view for discovery.
- Cursor pagination or virtualised/infinite loading in batches.
- Swipe or trailing row actions for Start Practice, Known and Add to List.
- Multi-select only after a long-press or Select action, with the Session Dock showing the selection tools.
- A clear results statement such as “124 tunes · 3 filters.”

**Filters:** The current full-screen modal is a sound base, but nested Key/Style/Time scroll boxes inside the scrolling modal create scroll traps. Use one scroll container, collapsible groups, selected chips at the top, `Clear`, and a sticky bottom action such as “Show 124 tunes.” Avoid navigation/refetch on every checkbox; apply once, or update the count without replacing the page.

**Create Tune:** This should be a focused progressive form. Ask for the minimum identity first—name and type—then reveal key, style, provenance and advanced fields. Search for possible duplicates as the title is entered and explain why an existing match is likely.

**Known and Practice Tunes:** Both pages currently render the whole set as large cards. Use the same compact Tune Row primitive as the catalogue, with search, grouping and pagination. Grouping options might include Recently practised, Due, Stage, Key and Style. Preserve the exact app language: **Start Practice**, **Already in practice**, and **Stage**.

### 6.5 Tune detail

**Routes/states reviewed:** `/library/401` and its actions.

Tune detail is currently an encyclopedia: repeated headings, repeated metadata and several large information cards make the core actions hard to find. Reframe it as:

1. **Compact identity header:** title, alternate title if useful, type/style, key, source confidence and personal status.
2. **Tabs:** Practice, Reference, About.
3. **Session Dock:** Start Practice / Already in practice, reference play and overflow.

The Practice tab should show Stage, due state, last result, short history and notes. Reference should preview the strongest source and open the full media workspace. About should contain provenance, aliases, related tunes, catalogue metadata and community data. Editing, reporting duplicates, deletion and moderator operations go into Manage, not the primary reading path.

### 6.6 Reference media

**Route/states reviewed:** `/library/401/reference-media` with Media, Sections and Practice.

This is the strongest existing product surface. It already feels like a working musician's tool: embedded media, passages, speed, loops and sections belong together. Make it the exemplar for the rest of the redesign.

- Keep media controls in the Session Dock so they survive movement between tabs.
- Let saved passages appear as named loop chips with duration.
- Make speed and loop state obvious at a glance.
- Use a waveform or simple time rail when the source permits it.
- Allow “Practise this passage” to create a lightweight session without changing the tune's entire state.
- Preserve media position and selected section when the screen locks, the person changes tabs or briefly leaves the app.
- On desktop, retain the two-column workbench: media on one side, sections/notes/practice on the other.

### 6.7 Practice and catch-up

**Routes/states reviewed:** `/review` base state and catch-up flow.

The page explains the system well but its large hero and lane cards push the actual tune below the first screen. Returning users should land directly on the next tune, with a small lane label and progress summary. The educational hero can appear on first use, empty states or via Help.

Starting a lane should enter Focused Practice:

- Tune title and minimum useful context
- Optional reference reveal
- Stage and queue progress
- Large persistent Rough, Shaky and Solid actions
- Undo for an accidental rating
- Next-tune transition
- End Session summary

Keep the current practice language consistent everywhere. Do not interchange “level,” “status” and “stage” when Stage is the product concept.

### 6.8 Diary, focus areas and index

**Routes/states reviewed:** diary day/week/month; Week Focus and Notes; Month Tunes, Focus and Notes; `/review/diary/index`; `/review/foci`; `/review/foci/1`.

The diary has strong raw material, particularly its week and month summaries. The issue is navigation density: multiple stacked pill rows consume a large portion of the phone before the content begins.

- Use one date header with previous, current period and next.
- Put Day/Week/Month in a compact segmented control.
- Put Tunes/Focus/Notes in a local tab row only where needed.
- Make month a musical heat map: intensity for practice volume, small semantic marks for Rough/Shaky/Solid mix.
- Let a week card answer: What did I practise? What improved? What needs attention next?
- Use the plain-language label **Focus areas** in the interface. “Foci” can remain an internal data name but sounds administrative to many users.
- A focus-area detail should connect intent to action: linked tunes, recent evidence, next review and a prominent “Practise this focus” action.

### 6.9 Lists and learning queue

**Routes/states reviewed:** `/learning-lists`, Learning Queue, Unsorted, Saved/Shared, `/learning-lists/69`, Create List and Manage List.

The Lists landing page begins with four stacked summary cards even when the person has already selected a mode. This pushes the actual list content below the fold. Replace them with a compact segmented count strip:

`Lists 12  |  Queue 84  |  Unsorted 41  |  Shared 6`

Then show the selected content immediately.

The Learning Queue is the longest phone surface tested, roughly 36,000 px with more than 170 forms. It needs pagination/virtualisation, grouping and batch actions. A queue is an ordered plan, so make order and readiness explicit rather than presenting it as a general card feed.

For list detail:

- Separate a calm reader/member view from Manage mode.
- Use drag handles for ordering only in Manage mode.
- Keep delete/remove behind an overflow or swipe action, not as a repeated prominent button.
- Show sharing state, owner and collaborators as a compact header.
- Offer “Start Practice from this list” as a primary action.
- Preserve distinction between personal learning lists, saved public lists and setlists.

### 6.10 Public lists

**Routes/states reviewed:** `/public-lists`, `/public-lists/74`, and missing-list handling.

Public lists should feel editorial and trustworthy, not like another administrative database. Use a cover treatment, curator identity, short premise, tune count and save state. A detail view should lead with why the list exists, then use compact tune rows. Missing lists should provide an intentional recovery screen with Back to Public Lists and search, not a bare technical 404.

### 6.11 Friends and activity

**Routes/states reviewed:** `/friends` with Add and Activity.

The Add flow is clear. Activity is much too expanded: every event repeats reaction controls, “Good craic,” a text field and Comment. Use a compact activity card with reaction count and comment count; expand comments only after a tap. Reuse the better collapsed treatment already visible in Home → Social.

Prioritise musically meaningful events: started learning a tune, made it Solid, published a list, shared a setlist, or developed new repertoire overlap. De-emphasise system noise.

### 6.12 Compare repertoires

**Routes/states reviewed:** `/compare`, a selected friend comparison, Compare in person, and invalid join handling.

This is one of Tunes' most differentiated ideas. The current result can render more than 80 tune cards, making the insight difficult to extract. Lead with outcomes:

- “You can play 24 tunes together now.”
- Shared Solid tunes
- Shared but shaky tunes
- Tunes one person can teach the other
- Suggested 6-tune session set
- Filterable full overlap below

Compare in person should be treated as a signature ritual: a warm, clearly timed join screen, a readable code/QR, privacy explanation, connected-state feedback and a result that can become a temporary setlist. Invalid or expired joins need a recovery action rather than a dead end.

### 6.13 Inbox

**Route reviewed:** `/inbox`.

“All caught up” is technically compatible with old activity below, but visually it implies there is nothing on the page. Separate:

- New
- History
- Messages
- Activity

Use unread markers, sender identity and concise event language. Group repetitive system activity. If direct messaging is not a real product goal, call the destination Notifications rather than Inbox.

### 6.14 Trends

**Routes reviewed:** `/trends` and `/trends/Bluegrass`.

Trends is over 10,000 px on phone and relies heavily on tall number cards. Convert counts into decisions:

- Practice volume sparkline
- Stage distribution
- Retention by week
- Style/key coverage
- Rough-to-Solid movement
- “Needs attention” list
- “Explore a gap” recommendation

Hide or collapse zero-value sections. Style detail should compare the person's repertoire with the catalogue or community in a small chart, then offer relevant lists and tunes.

### 6.15 Badges

**Routes/states reviewed:** `/badges`, badge detail, new badge and edit badge.

The badge names and folk-humour copy are some of the app's strongest brand material, but the UI presents them largely as text cards. Build a real badge visual system: embroidered patch, lino-cut, letterpress or carved-token art with a coherent shape grammar. Use colour by badge family, not random decoration. Award moments should be delightful but brief, with reduced-motion support.

Creation/editing screens are administrative and should live in the internal shell, not the consumer navigation.

### 6.16 Setlists

**Routes/states reviewed:** `/setlists`, `/setlists/3`, Create Setlist and Add Tune.

Setlists should feel like live musical objects rather than another list type.

- Order is primary; support drag reorder in Manage.
- Show key and tune type at a glance.
- Add a readiness strip using personal states without implying a public score.
- Show collaborators/players as avatars or initials.
- Add Performance Mode with very large current/next tune identity and minimal controls.
- Consider offline access to the active setlist and essential metadata because sessions and venues may have poor reception.

### 6.17 Profiles

**Routes/states reviewed:** own profile and another member's profile.

Profiles are currently among the longest pages in the app, roughly 28,000–32,000 px. A profile should express musical identity before inventory.

Use tabs:

- Overview
- Repertoire
- Lists
- Badges

Overview should contain a short bio, home tradition/location only if intentionally shared, favourite styles, a few featured tunes/lists, recent musical activity and overlap with the viewer. Repertoire receives search, compact rows and pagination. The owner's page can include edit controls, but visitor pages should remain uncluttered.

### 6.18 Moderator and development tools

**Routes reviewed:** `/moderator` and `/dev`.

These are useful but should not share the consumer shell. Create an internal workspace with its own restrained navigation, denser tables and clear environment/permission indicators. Hide it entirely from ordinary account navigation. This also reduces the sense that the app is unfinished when a consumer encounters internal tooling.

## 7. Desktop and larger screens

Desktop should not simply be the phone design stretched wider. It should become the deeper workbench promised by the app's complexity.

- Use a narrow persistent left rail for major destinations, collapsible to icons on medium widths.
- Keep the centre column for the primary object or feed.
- Use a contextual right panel for queue, metadata, reference notes or collaborators where appropriate.
- Home currently leaves a large unused right side while long content sits in one column. Use that space for Continue Practice, current focus, recent repertoire and social activity.
- Catalogue should use a responsive table/list with sortable columns and a detail preview, not only large cards.
- Reference Media already points in the right direction with a two-column workspace.
- Compare should use side-by-side summaries and grouped overlaps.
- Diary Month and Trends deserve wide charts; phone should receive smaller summaries, not the same chart squeezed down.
- At tablet widths, allow the Navigation Dock to become a side rail and preserve the contextual Session Dock.

## 8. Accessibility, semantics and performance

### 8.1 Touch and reach

Apple currently recommends 44 × 44 pt as the default iOS/iPadOS control size. Several current navigation and icon controls are smaller. Increase target area even when the visible icon remains compact, and leave enough separation to avoid accidental taps. Keep frequent actions in the middle and bottom reach zones.

### 8.2 Structure and keyboard/screen-reader behaviour

The reusable ClickableCard behaves like a link while containing real links and buttons. Even with click guards, this produces redundant and potentially confusing interaction semantics. Use one of two clean patterns:

- The entire object is one link, with no nested interactive controls; or
- The card is a non-interactive container with a clear title link and separate labelled actions.

Ensure pager dots, icon buttons, rating controls, loop controls and charts have meaningful accessible names and current-state announcements. Use headings as a real outline, not only visual text sizes.

### 8.3 Colour and transparency

- Meet at least 4.5:1 for ordinary text and 3:1 for large text and meaningful control boundaries.
- Support increased contrast and reduced transparency.
- Do not place text directly on unpredictable video/artwork without a strong legibility layer.
- Never encode Rough/Shaky/Solid or Stage by colour alone.

### 8.4 Data and rendering

The largest phone pages create large DOM and accessibility trees. Fix the data shape before adding animation:

- Cursor-page the catalogue, Known, Practice, Learning Queue, profiles and Compare.
- Virtualise only where necessary; conventional pagination is easier to reason about and often more accessible.
- Do not fetch separate unbounded “mobile” datasets.
- Preserve URL state for search, filters and grouping.
- Lazy-load media and non-visible profile sections.
- Hide zero-value trends before rendering their full structures.

### 8.5 Offline and resilience

The inspected project tree did not show an installable/offline shell. A later phase should cache the current practice queue, active setlist, tune identity, notes and recent diary state. Clearly show when an action is waiting to sync. Do not promise offline playback for third-party media that cannot legally or technically be cached.

## 9. Design-system and component changes suggested by the code

The existing implementation has useful foundations. `ResponsiveModal` already handles focus trapping, Escape, focus restoration, body locking, mobile sheet/full-screen modes and safe areas. Keep and evolve it. The new direction does not require rewriting the app from scratch.

Recommended shared primitives:

- `AppShell`: phone top bar + Navigation Dock; desktop rail + workspace.
- `NavigationDock`: five stable consumer destinations.
- `SessionDock`: adaptive contextual controls with collapsed and expanded states.
- `TuneRow`: compact reusable catalogue/repertoire/list/profile item.
- `TuneIdentity`: consistent title, type, key, provenance and state.
- `StatusMark`: semantic colour + icon + text.
- `SectionHeader`: heading, summary and optional action without another card.
- `FilterSheet`: selected summary, one scroll area and sticky result action.
- `GroupedSettings`: settings list and drill-in pages.
- `EmptyState` and `RecoveryState`: intentional zero, expired and missing-content experiences.
- `FocusModeShell`: Practice, Reference and Performance modes.

Refactor the current style tokens from raw colour roles into semantic jobs:

- `--surface-canvas`
- `--surface-paper`
- `--surface-note`
- `--text-primary`
- `--text-muted`
- `--action-primary`
- `--state-known`
- `--state-practice`
- `--state-due`
- `--state-overdue`
- `--state-social`
- `--action-destructive`

`CardPager` should remain for small finite sets such as a short practice queue or badge carousel. It should not be the catalogue's primary phone renderer.

## 10. Phased implementation plan

### Phase 0 — evidence and prototype (about 1 week)

Prototype five connected phone screens and the Session Dock:

1. Home → Today
2. Tunes catalogue
3. Tune detail
4. Focused Practice
5. Reference Media

Test the same flow with a few musicians using realistic tasks: find a tune, add it to practice, practise it, use a recording, rate it and return home. Decide the interaction model before polishing the rest of the app.

### Phase 1 — structural mobile foundations (roughly 2–4 weeks)

1. Add semantic design tokens and the new neutral/folk palette.
2. Replace the phone header navigation with the Navigation Dock.
3. Build the contextual Session Dock.
4. Replace catalogue CardPager and unbounded phone data with Tune Row + pagination.
5. Rebuild Tune Detail into Practice/Reference/About.
6. Add Focused Practice with persistent Rough/Shaky/Solid.
7. Make all primary touch targets at least 44 px and fix clickable-card semantics.

### Phase 2 — long-page and workflow repair (roughly 3–5 weeks)

1. Paginate Known, Practice, Learning Queue, profiles and Compare.
2. Replace nested-scroll Filters with the single-scroll apply sheet.
3. Compress Lists mode summaries and separate reading from Manage.
4. Rebuild Friends activity comments and Inbox hierarchy.
5. Simplify diary navigation and rename Foci to Focus areas in the interface.
6. Move Moderator/Dev to an internal shell.

### Phase 3 — distinctive product moments (roughly 3–6 weeks)

1. Finish Reference Mode and persistent media state.
2. Turn Compare in person into a polished session ritual.
3. Add Performance Mode to setlists.
4. Create the illustrated badge system.
5. Replace Trends count cards with actionable visualisations.
6. Add installable/offline resilience for active musical work.

### Phase 4 — refinement and validation

- Accessibility audit with keyboard, VoiceOver/TalkBack equivalents, contrast, reduced motion and text scaling.
- Performance budgets for initial JS, server response, catalogue query size and largest DOM.
- Cross-device checks at small phone, large phone, tablet portrait/landscape and desktop.
- Product-language sweep for Start Practice, Already in practice, Stage and Focus areas.
- Observe real musicians completing common tasks before adding more features.

## 11. Success measures

Track whether the redesign changes behaviour, not only whether it looks modern:

- Median time from app open to first practice rating.
- Percentage of practice sessions that reach at least three tunes.
- Time to find a known tune on phone.
- Catalogue search/filter completion and abandonment.
- Percentage of tune-detail visits that reach Reference Media or Start Practice.
- Learning Queue depth versus tunes actually practised.
- Compare result to setlist/session conversion.
- Return rate after a saved passage or focus area is created.
- Phone page weight, query count, DOM size and interaction latency.
- Accessibility completion rate for the same core tasks.

Useful guardrails:

- No ordinary phone list should require rendering hundreds of interactive objects at once.
- A returning user should reach the next practice tune within one tap from Home.
- A rating should always remain reachable with one thumb in Focused Practice.
- A status should remain understandable in grayscale.
- Every empty, expired or missing state should offer a next action.

## 12. The tool to use next

Use **Figma first** to prototype the five-screen phone flow and the Navigation/Session Dock system. Figma is the right tool because this is currently an interaction-architecture problem: it lets you try navigation, sheets, control expansion, palette and hierarchy cheaply before changing dozens of components.

Then use **Codex** to implement the shared primitives and data-loading changes. Codex is the right tool at that stage because the redesign repeats across many routes; changing shared components and tokens is safer and faster than hand-editing each screen.

Finally use the **in-app Browser** for a full route and breakpoint check after each phase. It is the right verification tool because it tests the actual production-like interface—including scroll length, overlays, touch targets and state transitions—not only static mock-ups.

## 13. Bottom line

Do not redesign Tunes as a prettier collection of green cards. Redesign it around the musician's active context.

The app should feel like opening a well-used tunebook that already knows what you were doing: the next tune is ready, the recording is at the right passage, the metronome appears when it is useful, practice judgement is under the thumb, lists behave like plans, setlists behave like performances, and community features lead to music people can actually play together.

That is how the 2026 design language becomes native to Tunes rather than borrowed from Apple.

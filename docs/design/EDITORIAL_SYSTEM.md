# Tunes editorial visual system

## Authority and reference

The Media Studio reference gives Tunes a **graphic language**, not a copied layout or a new feature set. Aim for a musician's publication and working tunebook: restrained editorial clarity, a little record-shop energy, and rare playful detail. Think roughly 60% quiet typographic discipline, 25% lively music-publication rhythm, 15% character. Avoid faux-Japanese motifs, cyberpunk styling, generic SaaS chrome, gradients, and decorative cards. The [product contract](../PRODUCT_CONTRACT.md) governs behavior and navigation; this document governs presentation. The [copy and contextual-menu standard](COPY_AND_CONTEXT_MENUS.md) governs the separate copy-reduction and action-disclosure workstreams. Routes, actions, data flows, and useful information stay intact.

V01 established shared tokens and an initial pass. **It did not complete an app-wide visual overhaul.** V02 in the [production queue](../automation/PLAN.md) must systematically inspect, correct, and render-check all user-facing surfaces before feature work resumes.

## Media Studio reference translated into Tunes

The agreed Media Studio discussion names **Cococo/noDatum** for calm, structured editorial composition and **Mid Japan Sound Complex/DIG Shibuya** for music-culture energy. Those are mood references, not assets or templates supplied to this repository; do not invent claims of pixel fidelity. Translate the first into a disciplined baseline grid, sharp hierarchy, generous margins and quiet rules. Translate the second into occasional assertive scale shifts, compact utility typography and the rhythm of a record sleeve or printed music index. Keep the final 15% of playful oddness rare and purposeful: one surprising scale or alignment moment, never a constant decorative theme. Print/photocopy texture, if ever used, must be subtle and cannot impair text, contrast or legibility.

For Tunes, the concrete visual equivalents are: a bold tune name where a sleeve would place the artist/title; key, type, time signature and BPM as publication-style utility data; learning stage and due state as clearly coded working annotations; set position and section as compact index notation; Practice controls as labelled equipment. Maintain an immediately readable musician workflow. Do not import Japanese text, motifs, decorative circles or unrelated record-shop graphics merely because the references have them.

No source Media Studio design files are stored in this Tunes repository. If a future owner-provided reference image or design file becomes available, compare against it explicitly and document what was adopted. Until then, use these agreed principles and the product contract as the reference.

## Visual grammar

1. **One dominant title per page.** The H1 is large, bold, left aligned, and immediate. Never place an eyebrow/overline above it. Put useful count or context beside or below it in quieter type; remove redundant descriptive copy.
2. **Hierarchy:** page or tune title → section heading → item name → compact metadata → occasional explanatory copy. A tune title is the strongest element on its detail view. A heading's size and weight must be consistent across routes at the same level.
3. **Layout:** deliberate grid, generous outer whitespace, aligned text starts, readable line length, and information density that respects musicians' scanning patterns. Thin rules and space divide sections. Do not add a second or third border where an ancestor or neighbor already supplies one.
4. **Wrappers:** default to an unboxed page region and ruled rows. Never put a card inside a card for ordinary grouping. A flat colour field is reserved for a genuinely different mode, active selection, or working surface. Dialogs, menus, and floating equipment can have their own surface when their behavior requires separation. Do not flatten their interaction affordances blindly.
5. **Rows over repeated cards:** tunes, lists, sessions, references, and people should read as editorial lists or table-like rows wherever the existing interaction allows. Keep row actions, focus states, and touch targets intact. Remove wrapper padding/borders that create an accidental nested panel.
6. **Controls:** square or lightly rounded, typographic, and equipment-like in Practice. Limit pills to controls whose shape clarifies state. Navigation is visually plain with an unmistakable active state. Colour describes state and selection; it is never confetti.
7. **Metadata:** key, style/type, time signature, BPM, learning state, due date, last practised, set position, and section are small, legible utility information. Use consistent order, separators, spacing, and muted ink. Do not hide relevant data merely to make a view look sparse.

## Copy as composition

Explanatory copy is a last layer, not the default structure. First use scale, alignment, grouping, state colour, symbols, direct labels, compact legends and disclosure. Remove sentences that repeat a visible heading, count, chart, state or button. Do not repeat a null relationship such as “New to me” on every catalogue row; absence of a relationship mark carries that meaning.

Keep precise text when it changes a decision: Stage/day interval and due date, rating meaning at first use, privacy audience, Known/Practice transitions, destructive consequences, contributor attribution, moderation provenance and recovery where unsaved work is at risk. Put defensive qualification at the action or information disclosure rather than leaving it permanently in the reading path.

Graphic summaries must remain literal. A Stage rail shows the revision interval and due date, not an invented mastery score. Diary and Trends may use bars, distributions, sparklines and direct annotations with a compact legend. Audience uses consistent lock/people/globe marks with accessible labels. Festival management uses explicit Draft, Selected and Live states.

## Contextual actions

Repeated collections should expose identity, relevant metadata and current state before actions. Keep a predictable title link to detail/reader content, an immediate reference/play control only when it is central, and a visible overflow/disclosure trigger for secondary actions. A relationship mark may open a focused state menu while continuing to display Known, In Practice, Stage and due state.

Use the same order across menus: open/view, play/reference, organise, personal state, contribute/manage, then separated destructive actions. Desktop menus are anchored; touch layouts may use a bottom sheet with the same capability. Menus require correct semantics, keyboard navigation, Escape/outside dismissal, focus return, touch targets, reduced motion and announced results. Never make right-click or long-press the only access path.

Primary task actions stay visible: Start/Resume Practice, Rough/Shaky/Solid, search and active filters, active form submission, invitation decisions, playback transport, Info/Reference switching, empty-state primary actions and beta feedback.

## Palette and material tokens

The source of truth is `app/globals.css`. Current neutrals: canvas `#f4efe4`, paper `#fffdf8`, note `#e9e1d3`, primary ink `#25231f`, muted ink `#675f55`, hairline `#d3c7b5`. Use canvas as the page field, paper sparingly for a true work surface, note for selected/secondary areas, and one hairline for division. Resting surfaces have no shadow. Ordinary corners use the existing small 0.2–0.35rem radius tokens.

Current semantic colour jobs: action brown `#5b4325`; Known olive `#68754a`; Practice blue `#466a78`; due amber `#c18b32`; overdue rust `#a9533e`; social plum `#755b72`; destructive red `#8e3934`. Match text foregrounds to the token pair, check rendered contrast, and never use a state colour as a decorative route theme. If a legacy alias or direct Tailwind class produces a mismatch, replace it at the appropriate shared or local layer. Do not rely on a broad CSS override to disguise inconsistent component wrappers.

## Responsive composition

Mobile and desktop are **two optimised presentations of the same product**, not pixel copies. Mobile keeps its reachable bottom navigation, concise tune actions, tabs, safe-area clearance, and readable stacked information. Desktop can use its rail, wider grids, visible adjacent information, and the existing two-pane tune/workbench concepts. Neither may lose a route, action, metadata field, state explanation, or keyboard/screen-reader affordance. Check narrow phone, wide phone/tablet, laptop, and wide desktop; adjust composition at real content breakpoints rather than shrinking desktop cards.

Tune detail is the centrepiece: dominant tune title, one compact metadata line/group, then Practice and Reference as page regions. Mobile may retain tabs; desktop may use the existing two-pane concept. Preserve playback, loops, attribution, actions, and navigation.

## Shell evidence and traversal

Two owner-supplied 4 October 2026 screenshots are starting evidence for V02, not an exhaustive surface inventory. One shows the expanded desktop rail with Home, Practice, Tunes, Lists, Social, Compare and the conditional Festival hub preview. The other shows the open account menu with Account & settings, Setlists, Badges, Trends, the Practice tools disclosure, Inbox, Metronome, Help & feedback, conditional Moderator and Developer tools entries, and Logout.

Use those screenshots to begin the shell review, then follow every visible entry into its destination and nested detail, edit, loading, error, empty, selected and overlay states. In particular, continue from Tunes into tune Info and Reference; from Lists and Setlists into reader/owner/detail/edit states; and from Practice tools into Diary, Focus areas, and Tune index & history. The screenshots do not replace the `app/**/page.tsx` inventory.

The desktop rail review must distinguish current, hover and focus states without making two destinations appear active; keep attention counts subordinate to the destination label; ensure native or custom labels never cover adjacent navigation; and keep the Festival hub absent unless the existing owner/developer-gated preview conditions apply. The account-menu review must cover closed/open placement, viewport clipping and scrolling, top-level active states, Practice tools collapsed/expanded/active states, keyboard focus/Escape/arrow behavior, and all conditional entries. Metronome and Help & feedback are event-driven overlays rather than routes and must be reviewed as such. A floating menu may retain a purposeful separate surface, but its typography, radius, shadow and internal rules must still use the editorial system.

## Code map

| Surface | Main files / ownership | Visual intent |
|---|---|---|
| Shell and tokens | `app/globals.css`, `components/layout/*`, `components/ui/*` | One canvas, integrated plain navigation, consistent type/rules/focus/materials. |
| Home and Practice | `app/page.tsx`, `app/review/*`, `components/home/*`, `components/practice/*` | Strong title, direct queue and session controls; Diary and focus remain a coherent workspace. |
| Tunes and detail | `app/library/*`, `app/repertoire/*`, `components/library/*`, `components/tunes/*`, `components/reference-media/*` | Scannable repertoire rows; tune title and metadata anchor Practice/Reference. |
| Lists and sets | `app/learning-lists/*`, `app/public-lists/*`, `app/setlists/*`, `components/lists/*` | Editorial rows, compact positions/sections, no card nesting. |
| Compare and social | `app/compare/*`, `app/friends/*`, `app/inbox/*`, `app/users/*`, `components/compare/*` | Plain navigation and legible overlap/status/people rows. |
| Supporting routes | badges, trends, events, auth, dev/moderator | Same hierarchy and palette; special-purpose surfaces retain needed affordances. |

## Required rendered review for V02 and later visual changes

Before marking a visual chunk complete, inspect its routes and meaningful states at a narrow phone, tablet, and desktop width using a local or disposable environment. Record route, viewport, state, observed defect, correction, and recheck in its result. Cover default, empty, long-content, selected, active, loading/error, dialog/menu, and focus states when the route exposes them. Review title dominance, no eyebrow, nested wrappers, repeated borders, palette/contrast, row density, metadata order, navigation selection, touch targets, fixed-control overlap, and safe areas. Review both responsive compositions for full functional parity. Compare neighbouring routes so the visual rhythm is coherent, not merely locally improved.

Do not infer a visual pass from source inspection, a build, or mockups. When access or fixtures prevent a state from being rendered, record precisely what was unverified and continue with reachable work; do not call it passed. Use read-only production access only; any mutation check belongs in a disposable environment. The owner retains final manual functional and visual acceptance, reported separately from agent-rendered verification. V02 is not finished until its whole-app inventory and integrated recheck are recorded.

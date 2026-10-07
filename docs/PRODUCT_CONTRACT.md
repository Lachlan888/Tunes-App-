# Tunes product contract

**Updated 5 October 2026.** This document is the product source of truth for future Codex work. Direct user instructions take precedence. Code and current runner state establish what is implemented; this document establishes what the app should mean. Older audits, prompt series, and results are historical when they conflict with it.

## Promise and user stories

Tunes helps a traditional musician **keep tunes ready to play**. The core loop is find or recall a tune → choose to know or practise it → play/review it → return when it is due. Lists and Compare support real sessions with other musicians. The interface should make the next useful action clear without presenting all features at equal weight.

Design and verify four stories: (1) a newcomer finds/imports and classifies a tune; (2) a returning player completes an honest review; (3) a learner finds a reference, practises, and returns; (4) two players use Compare to find common repertoire. Prefer careful editing, copy, hierarchy, and performance over new connected layers or subsystems.

## Fixed owner decisions

1. **Six primary destinations:** Home, Practice, Tunes, Lists, Social, and **Compare**. Compare stays its own destination and active state at phone and desktop widths.
2. **Visible beta feedback:** Help & feedback remains visibly available on every user-facing screen during beta, including focused Practice and phone layouts. Position and size may adapt so it never blocks ratings, playback, navigation, form controls, or content. Do not bury it solely in an account menu.
3. **Show review days:** Keep the existing internal scheduling method, but do not show numeric Stage labels. Show the review interval as a day count and the actual next due date, using human-readable dates. Do not replace it with an arbitrary mastery percentage. Do not add session goals, an invented `3 of 8` progress framing, or a five-tune target to explain practice.
4. **Festival only with a partner:** A festival section/promotion appears when the app owner has a real festival partnership and explicitly selects/enables its published hub. Off means the everyday app has no festival section or reserved space. Only the owner can manage or activate it. Do not publish invented programme data or turn production mode on for a test. Existing public/archived direct links follow their lifecycle rules.
5. **Tune detail has two views:** **Info** and **Reference** only. Info holds identity, personal state and actions, private notes, catalogue facts, provenance, aliases, related tune notes, attributed sources and folklore (including informant, collector, region, and story entries), public list appearances, and community discussion. Reference owns playback, recordings, and passage loops. Do not render a second player on Info or retain a separate Overview/About destination. Preserve existing deep links through deliberate redirects. Keep the existing attribution, visibility, reporting, moderation, and contribution behavior when moving this content.
6. **Diary is a focused workspace:** Diary, Day/Week/Month reflection, Focus Areas, and tune index/history form one self-contained Practice Diary area with its own local navigation. Outside that area, offer one entry in the account drop-down. At session completion, offer an optional Diary entry only if the user's existing Diary preference is enabled; Done remains the primary exit and declining does not interrupt saved reviews. Do not expose separate Diary/Focus/Index links in the everyday interface or persistent practice chrome. Preserve direct links, private data, and the existing preference. Keep beta feedback visible without intruding on reflection.
7. **Polish includes small defects:** Repeated borders, double/triple divider lines, cramped section joins, redundant headings, and awkward alignments are real design bugs. Check them across routes, not just in hero mockups. The Home example is caused by adjacent `border-y` wrappers in `HomeMobileSummarySwitcher` (`MobilePanel`, `MobileStatGrid`, and neighboring panels).
8. **Reduce explanatory copy through design:** Treat resting explanatory/defensive copy and contextual-menu adoption as separate design problems. Communicate relationships, visibility, schedules, lifecycle and metric meaning through hierarchy, compact state marks, direct labels, graphic summaries and one local legend before adding sentences. Put consequences at the decision point. Preserve review-day truth, privacy and destructive-action consequences, attribution, recovery guidance and accessible names. Follow the app-wide [copy and contextual-menu requirements](design/COPY_AND_CONTEXT_MENUS.md).

## State and data meaning

| Object/state | Meaning | What it must not imply |
|---|---|---|
| Shared tune (`pieces`) | Canonical tune record | The current user knows or intends to learn it. |
| List membership | User organisation; private/public sharing follows list visibility | A practice schedule or learning commitment. |
| In Practice (`user_pieces`) | Deliberately active review relationship | That a review already happened. |
| Known (`user_known_pieces`) | User's repertoire assertion or review outcome | Objective mastery or simultaneous active Practice. |
| Practice event | Actual tune work | A click that only enrolled or saved a tune. |
| Review event | Rated recall that changes scheduling | A generic note, list save, or page view. |

Known and In Practice are mutually exclusive for a user/tune. A state transition should be atomic and idempotent. The current “Learning Queue” is derived from list membership, not an explicit learning-intent table; explain that honestly and do not silently create a second queue. An action labelled **Add to practice** enrolls a tune; **Practise now** enters actual work. Enrolment alone must not credit a practice streak or broadcast that somebody practised.

Current scheduling intervals in `lib/review.ts` are **1, 2, 3, 7, 14, 30, 60, 90, 120, and 360 days**. The internal stage number determines the next interval but is never shown to users. Display only the day count, for example **“14-day review”** and **“Next review 17 Oct”**; when ready, **“14-day review due today”**. Solid advances one interval, Shaky holds it, and Rough returns to an earlier interval under the existing rules. If scheduling rules change, update this mapping and its copy together.

Practice opens/resumes the existing focused flow. Today’s due work and overdue catch-up remain intelligible; catch-up is an explicit continuation under the current method. Do not introduce arbitrary session-size targets. Show the tune, review-day interval, due state, reference, optional note, and Rough/Shaky/Solid in a calm order. Keep the existing diary and deeper practice tools available without placing them ahead of the review action.

## Information architecture and screen jobs

- **Home:** one obvious next action, a compact preview of repertoire, and optional social/festival context. Avoid parallel dashboards and duplicate counts or headings.
- **Practice:** start/resume a review, understand its review-day interval, rate it, and reach a clear completion/return state. Keep important feedback visible without obstructing ratings.
- **Tunes:** scan/search/filter shared tunes; understand each tune's personal state; reach a useful reference and one clear action. Compact rows can retain secondary actions without giving every button equal visual weight.
- **Tune Info/Reference:** Info is the one place for tune identity, personal state/history, notes, provenance, attributed lore and community context. Reference is the one place for playback and passage tools. Avoid giant empty notes areas and repeated identity cards.
- **Lists:** organise and read tunes in playing order. A list's cover colour should not imply meaning from its database ID. Reader and owner management states must be distinct.
- **Compare:** first-class destination. Explain “find tunes you can play together,” then show actual overlap, with consent/privacy retained. In-person code setup is contextual, not the whole opening story.
- **Social:** friends, invitations, and activity. Preserve social meaning without making the Home feed compete with practice.
- **Festival hub:** only curated partner material; owner-only enablement and publication controls; existing list, save, and Compare flows are reused.
- **Secondary tools:** Practice Diary contains its own Diary, Focus Areas, and tune history navigation, and has one account-menu entry plus its preference-gated session-end invitation. Trends, Badges, Setlists, account, and moderation remain reachable in their task context, without promotion simply because they exist.

## Copy and visual rules

Use Australian/British verb spelling: **practise**; use **Practice** for the noun/destination. Say what an action does. `Add to practice` is not `Practise now`; `I know this` is a self-report. Use human dates such as `17 Oct`, `Today`, and `Overdue since 2 Jul`, never raw timestamps. When a count is actionable, use one consistent definition across Home, Practice, and navigation. Avoid pairing “Due today 0” with an unexplained backlog of 27.

Do not label every catalogue tune with the absence of a personal relationship. In an ordinary tune collection, no state mark means no relationship; show Known, In Practice, review-day interval/due state, list membership and other real relationships when present. Do not narrate a chart, count or visible state in an adjacent paragraph. Explain an unfamiliar visual vocabulary once through a compact legend or information disclosure. Empty states get one useful diagnosis and one next action.

Contextual menus reduce repeated secondary actions but never hide the primary task, current state or navigation. A tune/list/person title remains a predictable route to its detail view unless the surface explicitly establishes a different interaction. Use a visible disclosure or overflow trigger; right-click and long-press are optional enhancements. Start/Resume Practice, Rough/Shaky/Solid, search/filters, active form submission, playback transport, Info/Reference switching, pending invitation decisions, empty-state primary actions and beta feedback remain visible.

The visual character is a musician’s editorial workspace derived from Media Studio, adapted to Tunes. Mobile and desktop are equally complete products with responsive composition rather than identical layouts. Use one dominant large bold heading per page and no eyebrow text above it. Never nest cards; use strong alignment, generous whitespace, compact graphic metadata and one thin rule between sections. Prefer editorial rows over tune cards, and sharply reduce radii and pills. Preserve useful information and all existing functions.

The visual character can remain warm and musical. Apply the existing semantic palette with restraint: readable ink, quiet paper surfaces, colour for state and the primary action. Keep one focal point per screen. Ordinary collections use rows and spacing rather than nested cards, shadows, and borders. One boundary between sections is enough. Avoid uppercase eyebrow labels that repeat nearby headings. Responsive controls, motion, and feedback should explain state changes; do not add decorative floating layers. Respect keyboard, screen readers, reduced motion, zoom, and touch targets.

Every action needs working, success, failure, and recovery states. Avoid dead-end empty screens, raw errors, and silent page refreshes. Visible feedback is important during beta and should carry route context without exposing private data.

## Performance and quality

Measure before calling a route slow. Important paths are Home → Practice → save rating → next tune; catalogue search → tune; list → tune; Compare → shared tune. Investigate the currently dynamic root/nav counts, Home's broad load, Lists' bounded full-collection reads, catalogue facets/media, and Compare repertoire reads before adding caches or indexes. Read-only page loads should not need persistence writes. Database changes require actual schema/query-plan inspection, privacy review, and rollback thinking.

The owner performs manual functional and visual acceptance. Agents should run targeted automated behavior/regression checks, lint/typecheck/build when relevant, and required database/permission tests. Do not report user-facing acceptance or deployment from a code pass alone.

## Completion test for a slice

For each changed flow, a first-time user can predict the result of its primary action; an existing user’s state is preserved; the interface has no duplicate rules/headings or hidden controls; keyboard/touch and error states work; and the evidence says exactly what was tested. If a slice alters this contract, update the contract in the same slice and explain the decision.

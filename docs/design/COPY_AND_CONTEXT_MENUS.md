# Explanatory copy and contextual menus

**Owner direction, 5 October 2026.** This document records the app-wide audit of defensive/explanatory copy and repeated visible actions. It is a design requirement for P42–P44. Treat copy reduction and contextual-menu adoption as separate workstreams with separate acceptance. The [product contract](../PRODUCT_CONTRACT.md) remains authoritative for product behaviour and the [editorial system](EDITORIAL_SYSTEM.md) remains authoritative for presentation.

## Intent

Tunes should communicate through hierarchy, state, symbols, spacing and interaction before adding sentences. A resting screen should describe the tune, list, person or practice state. It should not continuously defend the data model or explain every action that could be taken.

Copy reduction must not remove information needed to make a decision. Contextual menus must not hide the primary task, current state or route navigation. Preserve every working action, permission check, success/failure state, accessible name and return path.

## Explanatory-copy rules

1. **Show relationships only when they exist.** In ordinary tune collections, no personal-state mark means no relationship. Do not repeat “New to me” on every otherwise unrelated tune. Keep Known, In Practice, review-day interval, due, saved, shared and collaborator states visible.
2. **Explain a visual system once.** Put a compact legend or information disclosure beside an unfamiliar collection, chart or state system instead of repeating a sentence on each item.
3. **Put consequences at the decision point.** Copy beginning “This does not…”, “Only you…”, “Nothing else…” or “The shared tune remains…” belongs in the relevant action, disclosure or confirmation when it changes a decision. Do not repeat it across resting surfaces.
4. **Use one useful empty state.** Prefer one short diagnosis and one recovery/creation action. Suppress dependent empty regions when an upstream requirement is missing; for example, an empty Reference view should not repeat the absence of a recording in several player sections.
5. **Do not narrate visible data.** A chart, count or state strip should carry its own meaning through labels, position and a small legend. Do not add a paragraph that merely restates it.
6. **Keep safety and truth explicit.** Retain review-day interval and actual due date, Rough/Shaky/Solid meaning at first use, privacy audience changes, Known ↔ Practice consequences, destructive action consequences, contributor attribution, moderation provenance and recovery copy where unsaved work may be at risk.
7. **Keep invisible accessibility detail.** Compact visible controls retain precise accessible names, roles, keyboard behaviour and announcements.

## Graphic replacements

- Use a day-interval rail or annotation, never a mastery percentage.
- Use lock, people and globe marks for Private, Friends and Public; the text label remains available to assistive technology and in the disclosure.
- Use play/reference, list-membership, calendar/due and relationship marks as compact metadata with a consistent order.
- Use a small legend for Diary month colour/outcome letters and charts.
- Use bars, sparklines, distribution marks and direct annotations for Diary and Trends instead of explanatory metric paragraphs.
- Use a visible Draft → Selected → Live lifecycle for festival management, with confirmation at publication.
- Use an overlap/group motif on Compare so the opening purpose is visible before instructions.

## Surface requirements for copy reduction

| Surface | Required direction |
|---|---|
| Shell and account menu | Keep primary labels concise. Festival is absent from everyday navigation unless an eligible partner hub is enabled; owner/developer preview remains conditional. Reduce repeated grouping labels and identity copy without hiding secondary destinations. |
| Home | One dominant next action, compact repertoire/social context and completion marks instead of onboarding paragraphs. Remove duplicate counts and descriptions. |
| Practice | Keep the concise ready count and Start/Resume action. Explain day intervals and outcomes once at the point of use; use graphic schedule structure for repeated state. |
| Tunes catalogue | Title, musical metadata, real personal relationship, reference availability and compact list membership. Remove repeated “New to me” and equal-weight action strips. Show result count once. |
| Tune Info | Consolidate repeated Practice state, empty interval/schedule/result and instructions into one state strip and one relevant action. Use compact contributor/provenance disclosure. |
| Tune Reference | One empty player state and one Add recording action. Suppress unavailable whole-recording/passage regions until a source exists. |
| Lists and list detail | Use title, visibility mark, tune count, short purpose and playing order. Do not spell out ownership/visibility repeatedly on every row. Explain the derived Learning Queue once. |
| Compare | One primary Add musician flow; in-person and code entry are contextual alternatives. Avoid simultaneous introductory headings and instructions that state the same purpose. |
| Social and Inbox | Remove descriptions already established by Friends, Activity and Inbox headings. Let row state and content carry meaning. |
| Profiles and settings | Use consistent audience marks. Keep a short description only where a privacy or practice preference has a non-obvious consequence. |
| Diary, Focus and Trends | Replace narrated figures with compact labelled data, charts and legends. Keep one-sentence empty states. |
| Setlists | Use a lock-marked Private readiness strip and compact Known/Practice/New distribution. Explain privacy on disclosure. |
| Badges | Let artwork, earned/progress state and one description carry the card. Reserve full condition meaning for detail. |
| Festival, moderation and developer tools | Reduce repeated lifecycle prose through explicit states, but retain publication, moderation and destructive warnings at action time. |
| Loading and errors | Loading names the destination rather than enumerating every dependency. Errors say what failed, offer one recovery action and mention preservation only when data is actually at risk. |

## Contextual-menu rules

1. **Preserve an obvious primary path.** A title normally opens its detail/reader destination. A visible disclosure or overflow control opens secondary actions. A row may open a preview only when the behaviour is consistent and indicated.
2. **Keep state outside the menu.** Known, In Practice, review interval/due, unread, visibility, selected source and collaborator state remain visible. A state mark may itself open a focused state menu.
3. **Use a stable item order.** Open/view → play/reference → organise → personal state → contribute/manage → destructive actions. Separate destructive items visually.
4. **Adapt presentation, not capability.** Desktop uses an anchored menu. Touch layouts may use a bottom sheet. Both expose the same actions and permission rules.
5. **Do not use hidden-only gestures.** Right-click and long-press may be enhancements, never the only way to reach an action.
6. **Meet interaction requirements.** Use correct menu/dialog semantics, keyboard opening/navigation, Escape, outside dismissal, focus return, touch targets, reduced motion and live announcements for results.

## Contextual-menu placements

| Surface | Menu scope | Keep visible |
|---|---|---|
| Catalogue tune row | Open tune, Preview/Reference, Add to List, Add to Practice, Mark/Move Known and permission-gated contribution actions | Tune identity, musical metadata, real relationship and reference availability |
| Tune relationship mark | Practise now, move to Known, stop Practice and schedule detail | Current relationship, review interval and due state |
| Tune header Manage | Organisation, contribution, correction, report, moderation and removal | Info/Reference navigation and contextual primary action |
| Reference source | Select, open externally, edit attribution, report and remove when permitted | Current source and playback transport |
| List/list tune | Edit/share/duplicate/delete list; open/reference/organise/state/remove tune | List/tune identity, visibility/position and personal state |
| Setlist tune | Personal-status changes in the status control; performance metadata and removal in overflow | Running order, performance metadata and private readiness |
| Friend/profile row | Compare, message, open profile and relationship management | Identity and relationship |
| Activity/Inbox row | Open destination, mark read/unread and archive | Content, date, unread and reaction/comment state |
| Focus, badge and shared list | Open/use, edit/manage/share/archive/delete according to ownership | Identity, summary state and progress/count |
| Admin records | Edit, preview, lifecycle action and archive/delete | Record identity and lifecycle status |

## Actions that remain visible

- Start/Resume Practice and Rough/Shaky/Solid.
- Search, active filters and active view navigation.
- Save/Submit in an active form.
- Accept/Decline for a pending invitation.
- Main playback transport.
- Info/Reference switching.
- The primary action in an empty state.
- Visible beta feedback during beta.

## Recommended tune-row anatomy

The catalogue is the first implementation target. Prefer an editorial row with title and musical metadata on the left, real personal relationship and reference availability as compact metadata, and one overflow trigger for secondary actions. The title keeps its predictable tune-detail link. Do not make the title the sole menu trigger; that would remove the clearest route into tune detail.

## Acceptance

- Every user-facing route and its loading, empty, error, selected, editing and overlay states is checked against both workstreams.
- Copy reduction and contextual-menu adoption have separate results and can pass or fail independently.
- No action, permission gate, return path, status, attribution or accessible name is lost.
- Phone, tablet and desktop preserve the same capabilities with appropriate composition.
- Owner manual functional and visual acceptance remains separate from local agent verification.

# NFF27 draft festival tag

## Intent

Set up the National Folk Festival 2027 as an owner-only planning workspace. Create one private, empty repertoire list for each distinct session name in the supplied 2026 programme, with an `NFF27 — ` title prefix. Repeated weekend sessions stay one list. Where the programme names a leader in the session title, retain that wording.

The supplied programme is a 2026 source, not confirmation of a 2027 programme. No hub, list, session, or festival promotion becomes public as part of this work.

## Approach

1. **Extend the existing `festival_collections` relationship (chosen).** Treat its `festival_id` as the internal festival tag. Allow an owner to attach a private list while its hub is Draft, but preserve the existing public-list requirement for Published and Archived hubs. This retains the existing many-to-many relationship and prevents a duplicate tagging model.
2. Add a nullable `festival_id` column to `learning_lists`. Rejected: it duplicates the existing relationship, permits only one festival per list, and would blur a user list's independent identity.
3. Add a second generic tag table. Rejected: it duplicates `festival_collections` without improving festival ownership, ordering, or later publication handling.

## Behaviour and safeguards

- The owner creates a Draft hub named **National Folk Festival 2027** with the stable slug `national-folk-festival-2027` and Festival mode remains Off.
- Draft hubs may associate owner-visible private or public lists. The management UI makes private status clear.
- Published and Archived hubs can associate only public lists, and public festival loaders continue to expose only public lists.
- The NFF27 lists remain empty and private. Each carries a description identifying it as draft planning material derived from the supplied 2026 programme, pending 2027 confirmation.
- Create one held `festival_sessions` draft for each list and link it to that list. Preserve the programme wording in the session title but omit the 2026 dates, times and venues from the 2027 draft.
- Owner preview shows every associated private list and every held session together, including the linked list name and a clear release-eligibility state. Public festival routes remain unchanged: held sessions and private lists cannot appear after publication until the owner explicitly reviews them.

## NFF27 session lists

- `NFF27 — Session: Slow Scandinavian Tunes`
- `NFF27 — Session: Australian Traditional Music`
- `NFF27 — Session: Northern English Tunes`
- `NFF27 — Session: Québécois Tunes`
- `NFF27 — Session: Irish Tunes`
- `NFF27 — Session: Bangers the Kids Play These Days`
- `NFF27 — Session: Bluegrass`
- `NFF27 — Session: Songs We Sang in the Sixties`
- `NFF27 — Open Singing Session`
- `NFF27 — Session: Slow Irish Tunes`
- `NFF27 — Session: Morris Tunes`
- `NFF27 — Session: Bridges to Trad`
- `NFF27 — Session: Old-Time Music & Flatfooting`
- `NFF27 — Session: Hungarian Tunes`
- `NFF27 — Singing Session: Shanty Club`
- `NFF27 — Session: Slow Bluegrass Tunes`
- `NFF27 — Session: Southern English Tunes`
- `NFF27 — Session: Sing Like a Bloke`
- `NFF27 — Session: Trad Tunes with Dallahan`
- `NFF27 — Session: Spanish Folk Tunes`
- `NFF27 — Session: Windborne`
- `NFF27 — Session: Slow Tunes from Spain to Brittany`
- `NFF27 — Session: Scandinavian Tunes`
- `NFF27 — Session: Learn & Play Old-Time Tunes`

## Acceptance

- A schema constraint or trigger blocks private-list attachments to any non-Draft hub.
- Owner controls show private draft lists for Draft hubs and only public lists for Published/Archived hubs.
- Public festival routes remain unchanged: private lists do not appear.
- Tests cover the new lifecycle/visibility rule and retain the existing public-loader constraint.
- The NFF27 hub and its 24 lists are created through the authenticated application workflow, remain private, are associated with the Draft hub, and are visible in owner management.

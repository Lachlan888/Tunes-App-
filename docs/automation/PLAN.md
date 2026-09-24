# Final work sequence

Activated 15 September 2026: finish P19 → P20–P31 → P32 integration → P33 festival hubs → P18 release hardening. The current state/chunk continues unchanged. Prompts 20–33 are queued work, not completed work.

One row is one run, including verification. Most Prompt 19 implementation is documented complete. Trust each specification’s carried-forward summary and address ONLY its explicit remaining gaps. These are completion buckets, not ten new feature implementations; a documented finished bucket can be carried forward without a new audit. Ten P19 slices are deliberate: its expanded 15 requirements include independent provider, persistence and permission scenarios that should not share one large window. Split further before edits if a slice cannot fit. Normal startup loads only the current specification.

| Chunk | Goal | Depends on |
|---|---|---|
| [P19-01a](chunks/P19-01a.md) | Lists duplicate heading correction | none |
| [P19-01b1](chunks/P19-01b1.md) | Rendered Lists heading correction | P19-01a |
| [P19-01b2a](chunks/P19-01b2a.md) | Owned Lists card title/status/focus matrix | P19-01b1 |
| [P19-01b2b1](chunks/P19-01b2b1.md) | Prepare and smoke-check card fixtures | P19-01b2a |
| [P19-01b2b2](chunks/P19-01b2b2.md) | Saved/shared/discovery visual and focus matrix | P19-01b2b1 |
| [P19-02a](chunks/P19-02a.md) | List action return page | P19-01b2b2 |
| [P19-02b1](chunks/P19-02b1.md) | Authenticated Lists view navigation | P19-02a |
| [P19-02b2a](chunks/P19-02b2a.md) | Lists search, filter and paging | P19-02b1 |
| [P19-02b2b1](chunks/P19-02b2b1.md) | Lists detail return and history | P19-02b2a |
| [P19-02b2b1fix-a](chunks/P19-02b2b1fix-a.md) | Owned list return URL and regression | P19-02b2b1 |
| [P19-02b2b1fix-b1](chunks/P19-02b2b1fix-b1.md) | Saved/shared return URLs | P19-02b2b1fix-a |
| [P19-02b2b1fix-b2a](chunks/P19-02b2b1fix-b2a.md) | Discovery URL transport | P19-02b2b1fix-b1 |
| [P19-02b2b1fix-b2b-a](chunks/P19-02b2b1fix-b2b-a.md) | Authenticated Adam return and mode acceptance | P19-02b2b1fix-b2a |
| [P19-02b2b1fix-b2b-b](chunks/P19-02b2b1fix-b2b-b.md) | Nonzero list return defect reproduction | P19-02b2b1fix-b2b-a |
| [P19-02b2b1fix-b2b-b-fix](chunks/P19-02b2b1fix-b2b-b-fix.md) | Restore list-origin scroll position | P19-02b2b1fix-b2b-b |
| [P19-02b2b1fix-b2b-b-accept-button](chunks/P19-02b2b1fix-b2b-b-accept-button.md) | Button departure scroll restoration | P19-02b2b1fix-b2b-b-fix |
| [P19-02b2b1fix-b2b-b-accept-remaining-owned](chunks/P19-02b2b1fix-b2b-b-accept-remaining-owned.md) | Owned list filter and origin acceptance | P19-02b2b1fix-b2b-b-accept-button |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-saved](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-saved.md) | Saved filter/detail return acceptance | P19-02b2b1fix-b2b-b-accept-remaining-owned |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-filters](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-filters.md) | Shared/discovery filter returns | P19-02b2b1fix-b2b-b-accept-remaining-other-saved |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-discovery](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-discovery.md) | Live discovery overview pager return | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-filters |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-data](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-data.md) | Disposable saved/shared fixture data | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-discovery |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-setup](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-setup.md) | Isolated overview harness setup | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-data |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-wiring](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-wiring.md) | Disposable detail route wiring | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-setup |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-details](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-details.md) | Disposable detail pagination browser acceptance | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-wiring |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-shared](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-shared.md) | Shared search/group and overview return acceptance | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-details |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-saved](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-saved.md) | Saved overview page origin acceptance | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-shared |
| [P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept](chunks/P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept.md) | Disposable pager browser acceptance | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-saved |
| [P19-02b2b2](chunks/P19-02b2b2.md) | Lists view-switch side effects | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept |
| [P19-02b2b2-setup](chunks/P19-02b2b2-setup.md) | Disposable side-effect audit | P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept |
| [P19-02b2b2-accept](chunks/P19-02b2b2-accept.md) | View-switch browser side-effect acceptance | P19-02b2b2-setup |
| [P19-02b2b2-accept-coverage](chunks/P19-02b2b2-accept-coverage.md) | Populate five-view side-effect fixtures | P19-02b2b2-setup |
| [P19-02b2b2-accept-browser](chunks/P19-02b2b2-accept-browser.md) | Five-view browser side-effect acceptance | P19-02b2b2-accept-coverage |
| [P19-02c](chunks/P19-02c.md) | Lists role and visibility acceptance | P19-02b2b2-accept-browser |
| [P19-03](chunks/P19-03.md) | Inline review playback and direct Reference routing | P19-02c |
| [P19-04](chunks/P19-04.md) | Catalogue preview, actions and filter layering | P19-03 |
| [P19-05](chunks/P19-05.md) | Reference transport and loop draft creation | P19-04 |
| [P19-06](chunks/P19-06.md) | Saved loop playlist and rejected writes | P19-05 |
| [P19-07](chunks/P19-07.md) | Persistent floating metronome | P19-06 |
| [P19-08](chunks/P19-08.md) | Home and Social continuity | P19-07 |
| [P19-09](chunks/P19-09.md) | Rendered contrast and remaining duplicate headings | P19-08 |
| [P19-10](chunks/P19-10.md) | Prompt 19 integration and finalisation | P19-01a/P19-01b1/P19-01b2 through P19-09, all passed |
| [P20-a](chunks/P20-a.md) | Shared action styles and Lists exemplar | P19-10 |
| [P20-b1](chunks/P20-b1.md) | Lists, setlists and shared-list action overrides | P20-a |
| [P20-b2](chunks/P20-b2.md) | Home, social, Compare and trends action overrides | P20-b1 |
| [P20-b3](chunks/P20-b3.md) | Tunes and practice action overrides | P20-b2 |
| [P20-b4](chunks/P20-b4.md) | Settings, internal, auth and shared UI actions; final radius audit | P20-b3 |
| [P21-01](chunks/P21-01.md) | Home streak composition | P20-b4 |
| [P22-a](chunks/P22-a.md) | Shared contained feed and Home | P21-01 |
| [P22-b](chunks/P22-b.md) | Social feed adoption | P22-a |
| [P23-a](chunks/P23-a.md) | Practice entry and data source | P22-b |
| [P23-b](chunks/P23-b.md) | Focused review separator | P23-a |
| [P24-a](chunks/P24-a.md) | Catalogue row actions and pager | P23-b |
| [P24-b](chunks/P24-b.md) | Compact catalogue preview | P24-a |
| [P25-a](chunks/P25-a.md) | Reference transport composition | P24-b |
| [P25-b](chunks/P25-b.md) | Provider and responsive transport acceptance | P25-a |
| [P26-a](chunks/P26-a.md) | Public lists hierarchy | P25-b |
| [P26-b](chunks/P26-b.md) | Shared list reader heading | P26-a |
| [P27-a](chunks/P27-a.md) | Contribution enforcement and field matrix | P26-b |
| [P27-b](chunks/P27-b.md) | Contribution actions and concurrency | P27-a |
| [P28-a](chunks/P28-a.md) | Inline field editing | P27-b |
| [P28-b](chunks/P28-b.md) | Contributor presentation | P28-a |
| [P29-a](chunks/P29-a.md) | Bounded friend suggestions | P28-b |
| [P29-b](chunks/P29-b.md) | Suggestion UI and action states | P29-a |
| [P30-01](chunks/P30-01.md) | Direct suggested-friend comparison | P29-b |
| [P31-a](chunks/P31-a.md) | Readable invite aliases | P30-01 |
| [P31-b](chunks/P31-b.md) | Host and join journeys | P31-a |
| [P32-01](chunks/P32-01.md) | Feedback integration acceptance | P31-b |
| [P33-01](chunks/P33-01.md) | Foundation and enforced visibility | P32-01 |
| [P33-02](chunks/P33-02.md) | Dev editing and preview | P33-01 |
| [P33-03](chunks/P33-03.md) | Public hub and session presentation | P33-02 |
| [P33-04](chunks/P33-04.md) | Day-by-day session schedule | P33-03 |
| [P33-05](chunks/P33-05.md) | Existing save/auth and Compare journeys | P33-04 |
| [P33-06](chunks/P33-06.md) | Home promotion and archive lifecycle | P33-05 |
| [P33-07](chunks/P33-07.md) | Integrated festival acceptance | P33-06 |
| [P18-01](chunks/P18-01.md) | Confirmed code and check failures | P33-07 |
| [P18-02](chunks/P18-02.md) | Bounded data and measured performance | P18-01 |
| [P18-03](chunks/P18-03.md) | Account isolation and offline recovery | P18-02 |
| [P18-04](chunks/P18-04.md) | Accessibility and semantic consistency | P18-03 |
| [P18-05](chunks/P18-05.md) | Route and responsive regression defects | P18-04 |
| [P18-06](chunks/P18-06.md) | Final app-wide release verification | P18-01 through P18-05, all passed |

P18 plans are derived from the actual hardening requirements and currently present bounds, storage, resilience and integration files. Reconcile them after P33 acceptance; split on real failures without expanding feature scope. Final chunks only integrate/verify. Keep completed evidence in per-chunk results, not this index or state.

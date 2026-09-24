# P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept — Disposable pager browser acceptance

Depends P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-saved. Next P19-02b2b2. Prompt 19 item 6.
Carry forward predecessor discovery overview page-two acceptance and existing filter/scroll evidence. Typed saved/shared summary fixtures are in tests/integration/fixtures/list-pagers.ts; these are data only, not browser or permissions evidence.
Remaining: connect fixtures to a disposable local rendering harness using actual route/components; demonstrate nonempty shared search/group/detail return, saved/shared overview page origins, owned/shared/public detail pagination (live owned lists have at most 20 tunes), discovery detail pagination if still uncovered, and distinct nonzero scroll lifecycle only if not covered. Do not send synthetic IDs to production or mutate production. Split before oversized harness setup or defect repair. No new production fixture routes. Browser checks must exercise real navigation and not disabled links. Preserve all outstanding acceptance on split.

Setup predecessor provides tests/integration/list-pager-harness.mjs for an isolated overview server. Detail wiring successor slice now supplies real owned/shared/public detail routes and typed 21-tune loaders; HTTP page-two smoke passed 2026-09-16. Use these for browser checks. Discovery overview return may still need disposable loader wiring. HTTP setup evidence is not browser/navigation/permissions evidence. Split further before oversized work; preserve all outstanding acceptance above.

Split 2026-09-16: detail pagination is checked first in P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-details; carry its evidence forward on completion. All shared search/group/detail return, saved/shared overview origins, discovery overview wiring if necessary, and distinct nonzero scroll lifecycle remain here.

Accepted 2026-09-16: P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-details passed four real Next/Previous journeys for owned/shared detail and public detail with saved/discovery origins. Each displayed 20 → 1 → 20 tunes and retained return_to plus Back link target. Do not repeat detail paging; overview Back navigation and the other remaining scenarios above are still pending.

Split this run: shared search/group/detail return and shared overview page origin are assigned to P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-shared. Remaining saved overview origin, discovery wiring if necessary, and distinct nonzero scroll lifecycle stay here.

Accepted 2026-09-16: P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-shared passed nonempty shared search/group filtering, real page-two Read the list navigation and Back restoration of search/group/page. Remaining only saved overview origins, discovery wiring if necessary and distinct nonzero scroll lifecycle.

Split 2026-09-17: saved overview page origin assigned to P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-saved. Only distinct nonzero scroll lifecycle and discovery wiring if required remain here.

Accepted 2026-09-17: P19-02b2b1fix-b2b-b-accept-remaining-other-rest-pagers-fixtures-browser-accept-saved passed saved nonempty search/group filtering and real page-two detail Back return, preserving search/group/page. No remaining saved/shared overview or detail paging gaps. Only distinct nonzero scroll lifecycle (and discovery harness wiring if necessary for that check) remains.

Accepted 2026-09-22 (recovered interrupted browser run): nonzero Back restoration at 488 and 1440 pixels; pending 720-pixel origin isolated from alternate group; matching origin restored; consumed positions not replayed on later ordinary visits. No remaining gaps in this chunk. See matching result for source task/turn and limitations. Next P19-02b2b2.

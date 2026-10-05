# Tunes page mockups

Static desktop design references for the [product contract](../../PRODUCT_CONTRACT.md) and [P35–P44 redesign sequence](../../automation/REDESIGN_SEQUENCE.md). They show the intended hierarchy, copy, density, and relationship between screens. The later [copy and contextual-menu standard](../COPY_AND_CONTEXT_MENUS.md) is authoritative where it asks for less resting copy or contextual secondary actions. Mockups are **not** live implementation, pixel specifications, evidence of completed accessibility or mobile work, or permission to invent data. Preserve existing behavior, permissions, and state semantics while applying them.

| Screen | File | Main decision |
|---|---|---|
| Home | [home.png](home.png) | One next action; repertoire and social are previews, with clean section boundaries. |
| Focused Practice | [practice.png](practice.png) | Stage and its day interval, due state, reference, note, and Rough/Shaky/Solid are legible. No arbitrary session goal. |
| Practice finish | [practice_finish.png](practice_finish.png) | Optional Diary invitation appears only after actual practice when the user's preference is on; Done remains clear. |
| Practice Diary | [diary.png](diary.png) | Self-contained journal workspace for Diary, Focus areas, and tune history, entered from the account menu or the optional finish invitation. |
| Tunes | [tunes.png](tunes.png) | Searchable, compact catalogue with clear personal state and one primary row action. |
| Tune Info | [tune.png](tune.png) | Info holds personal actions, notes, sources, folklore, related tune and community context. It links to Reference without duplicating the player. |
| Tune Reference | [reference.png](reference.png) | Playback, recordings, speed, and passage loops live here. These are the tune page's only two views: Info and Reference. |
| Lists | [lists.png](lists.png) | Neutral list organisation and clear ownership/visibility. |
| List reader | [list.png](list.png) | Playing order first; save or manage controls reflect permissions. |
| Compare | [compare.png](compare.png) | A first-class destination for tunes two people can play together. |
| Social | [social.png](social.png) | Activity and people support the core music workflow. |
| Festival | [festival.png](festival.png) | Conditional partner hub, absent from ordinary navigation until the owner enables a real published partnership. All contents shown here are illustrative placeholders. |

[overview.png](overview.png) collects the twelve screens and states for quick review. **Help & feedback is visibly available on every screen during beta**, including focused Practice and Diary. Its placement may adapt at smaller widths without covering controls.

The illustrations use sample tune and account data to communicate layouts. Dates and counts are examples, not the current database. The festival mockup represents a future enabled state; it does not name an actual partner or authorize publication. Agents must verify empty, loading, error, keyboard, zoom, touch, and responsive states in the implementation.

Source is in [`render.swift`](render.swift) and [`contact.swift`](contact.swift). On macOS, regenerate with:

```bash
CLANG_MODULE_CACHE_PATH=/private/tmp/tunes-swift-cache SWIFT_MODULE_CACHE_PATH=/private/tmp/tunes-swift-cache swift -module-cache-path /private/tmp/tunes-swift-cache docs/design/mockups/render.swift docs/design/mockups
CLANG_MODULE_CACHE_PATH=/private/tmp/tunes-swift-cache SWIFT_MODULE_CACHE_PATH=/private/tmp/tunes-swift-cache swift -module-cache-path /private/tmp/tunes-swift-cache docs/design/mockups/contact.swift docs/design/mockups
```

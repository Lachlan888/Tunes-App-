# Tunes feedback prompt series 20–32

Thirteen focused prompts turn the 15 September document and all 16 inspected screenshots into executable work. A shared contract keeps repeated context small; the larger prompts have explicit implementation and verification slices. Most changes refine existing UI. Tune contributions, suggestions and word codes receive separate server and interface slices where needed.

**Status:** registered in the existing runner on 15 September 2026. The active P19 chunk continues unchanged; these slices execute after its acceptance, followed by [Prompt 33 festival hubs](../prompts/33.md) and P18 release hardening.

## Sequence

- [20 — Consistent action button shape](prompts/20.md)
- [21 — Replace Home schedule with streaks](prompts/21.md)
- [22 — Make Home and Social activity scroll as a feed](prompts/22.md)
- [23 — Simplify the Practice entry and review layout](prompts/23.md)
- [24 — Fit catalogue actions and preview on a laptop](prompts/24.md)
- [25 — Put Reference transport in the persistent bar](prompts/25.md)
- [26 — Promote Public lists and simplify list reading](prompts/26.md)
- [27 — Enforce fill once tune contributions with attribution](prompts/27.md)
- [28 — Add inline tune editing and quiet contributor credits](prompts/28.md)
- [29 — Suggest relevant musicians in Find friends](prompts/29.md)
- [30 — Compare with a suggested friend in one click](prompts/30.md)
- [31 — Use readable themed Compare join codes](prompts/31.md)
- [32 — Accept the feedback series without repeating finished work](prompts/32.md)

The continuation is also indexed in [the main prompt catalogue](../../Prompt%20Series).

## How to use

Read [the shared contract](CONTRACT.md) once. For each scheduled run, load only that contract, the live runner state and the active prompt/slice. The individual files are ready to supply as work specifications; their `Start with` paths are entry points rather than instructions to read every file.

All slices are registered in ../chunks and ../PLAN.md. Use the existing automation; keep P19 in progress until its acceptance passes.

Activated ordering: finish P19, run 20–31, integrate with 32, implement Prompt 33 festival hubs, then finish remaining P18 release hardening. P18-06 owns the final broad release gate.

## Product decisions used

- “Any user can contribute” means any signed-in user; populated canonical fields require moderator/admin correction. Each empty field remains independently contributable.
- Public lists gets a clear label and equal prominence beside My lists inside Lists.
- Home and Social share a contained scrolling feed; existing progressive loading remains intact.
- The compact-preview acceptance target is a 1366×768 laptop viewport at 100% zoom, with 1440×900 also checked; shorter/zoomed views may scroll accessibly.
- Join codes use short musical word sequences while retaining existing consent and invitation expiry. Example words are illustrative, not a fixed code.

## Coverage and evidence

See [feedback source index](../../ui-feedback/september-15/README.md). All 16 images were opened individually and associated with the nearby document feedback. They are observed problem evidence, not a demand to reproduce the surrounding UI.

Token efficiency comes from narrow context, reusing completed evidence, stable field/scoring decisions, and one final broad gate. No numeric token saving is promised. No artificial token budget or model changes are required.

# V01 — Editorial visual-system overhaul

- Priority: first before P35-03 and all further feature work. P35-02 is already complete.
- Scope: shell/navigation, shared typography/materials/controls, Home, Practice, Tunes, Tune detail/Reference, Lists, Compare and secondary routes. Mobile and desktop compose the same functions for their respective widths.
- Preserve: all routes, data flows, actions, accessibility semantics, focus, keyboard, touch, loading/error/empty states and visible Help & feedback.
- Design acceptance: no nested cards or eyebrow above page titles; one dominant title; editorial grid/rows, compact state-aware metadata, thin rules, restrained colour, small radius. No useful information hidden for sparseness.
- Code evidence: affected tests, complete test suite, typecheck, lint and production build. Inspect resulting diff for behavior changes. Owner performs manual visual and functional acceptance; record it as pending until confirmed.
- On code acceptance: return to P35-03 with its saved scope and checkpoint. Do not claim deployment or owner acceptance.

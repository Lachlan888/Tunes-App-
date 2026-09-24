# Disposable card presentation fixture

Source: `page.tsx.fixture`. It renders the actual SavedSharedView (three saved + three directly shared cards) and SharedListCard (three discovery cards), with short/medium/long synthetic titles, owner metadata and counts 1/12/123. No production loaders/actions are imported by the fixture. The existing dev layout still enforces administrator authentication. Fixture rendering is development-only; its capture handlers prevent card navigation/submission and its unbookmark handler is a no-op. Never infer real permissions or persistence from this fixture.

From the repository root, install without overwriting existing work:

```python
from pathlib import Path
source = Path('docs/automation/results/P19-01b2b/page.tsx.fixture')
route = Path('app/dev/card-presentation-fixture/page.tsx')
route.parent.mkdir(exist_ok=False)
with route.open('x') as target:
    target.write(source.read_text())
```

Use the existing local development server and authenticated Chrome at `http://localhost:3000/dev/card-presentation-fixture`. First complete P19-01b2b1's smoke check: actual fixture visible, all nine articles present, no compilation/runtime error. Smoke check passed on 14 September 2026 UTC after administrator sign-in: nine articles rendered and browser error/warning logs were empty. If reinstalling the route yields an unavailable page, touch the installed page to refresh the development watcher, then reload. Scoped ESLint passed on the installed route that day. Do not repeat lint unless source changes.

Stop after that slice. P19-01b2b2 later checks title wrapping, relationship/metadata/actions and keyboard focus at 390/768/1440, recording DOM and screenshot evidence. Use the existing grid classes; fixture container is max-w-7xl with px-4/sm:px-6. Record any difference from real Lists shell widths. Do not count this fixture as full real-page integration acceptance.

Always remove the temporary route after use, preserving unexpected edits:

```python
from pathlib import Path
source = Path('docs/automation/results/P19-01b2b/page.tsx.fixture')
route = Path('app/dev/card-presentation-fixture/page.tsx')
assert route.read_bytes() == source.read_bytes()
route.unlink()
route.parent.rmdir()
```

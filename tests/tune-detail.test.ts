import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  getTuneDetailHref,
  resolveTuneDetailView,
} from "../lib/tune-detail-view.ts"

test("tune detail URLs have three stable views and a Practice default", () => {
  assert.equal(resolveTuneDetailView(undefined), "practice")
  assert.equal(resolveTuneDetailView("practice"), "practice")
  assert.equal(resolveTuneDetailView("reference"), "reference")
  assert.equal(resolveTuneDetailView("about"), "about")
  assert.equal(resolveTuneDetailView(["about", "reference"]), "about")
  assert.equal(resolveTuneDetailView("community"), "about")
  assert.equal(resolveTuneDetailView("overview"), "practice")
  assert.equal(resolveTuneDetailView("unexpected"), "practice")
  assert.equal(getTuneDetailHref(42, "reference"), "/library/42?view=reference")
})

test("the tune identity, three views and Session Dock keep one action hierarchy", () => {
  const page = readFileSync(
    new URL("../app/library/[id]/page.tsx", import.meta.url),
    "utf8"
  )
  const navigation = readFileSync(
    new URL("../components/library/TuneDetailViewNav.tsx", import.meta.url),
    "utf8"
  )
  const sessionDock = readFileSync(
    new URL(
      "../components/session-dock/TuneDetailSessionDock.tsx",
      import.meta.url
    ),
    "utf8"
  )

  assert.match(page, /<TuneIdentity/)
  assert.match(page, /sourceSummary=/)
  assert.match(page, /activeView === "practice"/)
  assert.match(page, /activeView === "reference"/)
  assert.match(page, /activeView === "about"/)
  assert.match(page, /resolveReferenceMediaSource/)
  assert.match(page, /Open Reference Mode/)
  assert.match(page, /typedReviewHistory/)
  assert.match(page, /Start Practice/)
  assert.match(page, /Already in practice/)
  assert.doesNotMatch(navigation, /label: "Overview"/)
  assert.doesNotMatch(navigation, /label: "Community"/)
  assert.match(navigation, /label: "Practice"/)
  assert.match(navigation, /label: "Reference"/)
  assert.match(navigation, /label: "About"/)
  assert.match(sessionDock, /isInPractice/)
  assert.match(sessionDock, /label: "Already in practice"/)
  assert.match(sessionDock, /label: "Start Practice"/)
})

test("Manage and route recovery expose permission-safe tune actions", () => {
  const canonicalDetails = readFileSync(
    new URL(
      "../components/library/TuneCanonicalDetailsCard.tsx",
      import.meta.url
    ),
    "utf8"
  )
  const pageOptions = readFileSync(
    new URL("../components/library/TuneDetailPageOptions.tsx", import.meta.url),
    "utf8"
  )
  const loading = readFileSync(
    new URL("../app/library/[id]/loading.tsx", import.meta.url),
    "utf8"
  )
  const error = readFileSync(
    new URL("../app/library/[id]/error.tsx", import.meta.url),
    "utf8"
  )
  const notFound = readFileSync(
    new URL("../app/library/[id]/not-found.tsx", import.meta.url),
    "utf8"
  )

  assert.match(pageOptions, />\s*Manage\s*</)
  assert.match(canonicalDetails, /Report possible duplicate/)
  assert.match(canonicalDetails, /Request correction/)
  assert.match(canonicalDetails, /Edit shared tune details/)
  assert.match(canonicalDetails, /Delete shared tune for everyone/)
  assert.match(canonicalDetails, /isModerator/)
  assert.match(loading, /aria-busy="true"/)
  assert.match(error, /onPrimaryAction=\{reset\}/)
  assert.match(notFound, /name="q"/)
  assert.match(notFound, /Back to Tunes/)
})

test("view-scoped loading keeps shared identity data stable", () => {
  const loader = readFileSync(
    new URL("../lib/loaders/tune-detail.ts", import.meta.url),
    "utf8"
  )
  const practiceHistory = readFileSync(
    new URL(
      "../lib/loaders/tune-detail/practice-history.ts",
      import.meta.url
    ),
    "utf8"
  )

  assert.match(loader, /needsComments = scope === "about"/)
  assert.match(loader, /needsPracticeHistory = scope === "practice"/)
  assert.match(loader, /loadTuneLinks/)
  assert.match(practiceHistory, /typedReviewHistory/)
  assert.match(practiceHistory, /review_event_id/)
  assert.match(practiceHistory, /resulting_stage/)
})

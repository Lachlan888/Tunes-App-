import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"

const loaderSource = readFileSync(new URL("../lib/loaders/festivals.ts", import.meta.url), "utf8")
const pageSource = readFileSync(new URL("../app/events/[slug]/page.tsx", import.meta.url), "utf8")
const sessionsSource = readFileSync(new URL("../components/events/FestivalSessions.tsx", import.meta.url), "utf8")

test("public festival loader exposes only published or archived hubs with public lists", () => {
  assert.match(loaderSource, /\.in\("lifecycle", \["published", "archived"\]\)/)
  assert.match(loaderSource, /learning_lists!inner\(id,name,description,visibility\)/)
  assert.match(loaderSource, /\.eq\("learning_lists\.visibility", "public"\)/)
  assert.doesNotMatch(pageSource, /source_note|needs_review/)
})

test("review-only session metadata is withheld from the public result", () => {
  const publicSessionSelect = loaderSource.match(/from\("festival_sessions"\)\.select\("([^"]+)"\)/)?.[1]
  assert.ok(publicSessionSelect)
  assert.doesNotMatch(publicSessionSelect, /leader_profile_id|source_note|needs_review/)
  assert.match(loaderSource, /\.eq\("needs_review", false\)/)
  assert.match(loaderSource, /const PUBLIC_HUB_FIELDS = "(?![^"]*curator_profile_id)/)
  const publicCollectionSelect = loaderSource.match(/from\("festival_collections"\)\.select\("([^"]*description[^"]*)"\)/)?.[1]
  assert.ok(publicCollectionSelect)
  assert.doesNotMatch(publicCollectionSelect, /profile_id/)
})

test("hub presents safe fallbacks and clear repertoire and snapshot wording", () => {
  assert.match(pageSource, /Festival archive/)
  assert.match(sessionsSource, /Date to be announced/)
  assert.match(sessionsSource, /Time to be announced/)
  assert.match(pageSource, /suggested repertoire, not guaranteed setlists/i)
  assert.match(pageSource, /programme information/)
  assert.match(pageSource, /Official programme/)
  assert.match(pageSource, /Collections are being prepared/)
})

test("hub reuses public list learning and normal Compare paths", () => {
  assert.match(pageSource, /href={`\/public-lists\/\$\{collection\.learning_list\.id\}`}/)
  assert.match(pageSource, /Explore tunes and references/)
  assert.match(pageSource, /href="\/compare"/)
  assert.doesNotMatch(pageSource, /TuneMediaLauncher|YouTubeLoopPlayer|<audio|<video/)
})

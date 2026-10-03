import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

test("Home renders only the safe promotion result without changing navigation", () => {
  const home = source("../app/page.tsx")
  const promotion = source("../components/home/FestivalPromotion.tsx")

  assert.match(home, /loadFestivalPromotion\(\)/)
  assert.match(home, /leadingContent=\{promotion\.festival \? <FestivalPromotion/)
  assert.match(promotion, /href={`\/events\/\$\{festival\.slug\}`}/)
  assert.match(promotion, /festival\.branding_image_url && festival\.branding_alt/)
  assert.doesNotMatch(home, /FestivalManager|mode_enabled|selected_festival_id/)
  assert.doesNotMatch(promotion, /nav|publish|archive|save|bookmark/i)
})

test("promotion fails closed and requires mode-on plus the selected published hub", () => {
  const loader = source("../lib/loaders/festivals.ts")
  const promotionStart = loader.indexOf("export async function loadFestivalPromotion")
  const publicHubStart = loader.indexOf("export async function loadPublicFestivalFoundation", promotionStart)
  const promotion = loader.slice(promotionStart, publicHubStart)

  assert.match(promotion, /mode_enabled: false, selected_festival_id: null/)
  assert.match(promotion, /!settings\?\.mode_enabled \|\| !settings\.selected_festival_id/)
  assert.match(promotion, /\.eq\("id", settings\.selected_festival_id\)/)
  assert.match(promotion, /\.eq\("lifecycle", "published"\)/)
  assert.match(promotion, /\.select\(PUBLIC_HUB_FIELDS\)/)
  assert.match(promotion, /catch \{[\s\S]*return safe/)
  assert.doesNotMatch(promotion, /curator_profile_id/)
})

test("lifecycle changes invalidate Home while archives keep their stable direct route", () => {
  const actions = source("../lib/actions/festivals.ts")
  const loader = source("../lib/loaders/festivals.ts")

  assert.match(actions, /revalidatePath\("\/"\)/)
  assert.match(actions, /revalidatePath\(`\/events\/\$\{slug\}`\)/)
  assert.match(loader, /\.in\("lifecycle", \["published", "archived"\]\)/)
  assert.match(loader, /\.eq\("slug", slug\)/)
  assert.doesNotMatch(actions, /learning_list_bookmarks[^\n]*(?:delete|update)|from\("learning_list_bookmarks"\)/)
})

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const ts = require("typescript")

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8")
}

function promotionFixture(settings: Record<string, unknown> | null, festival: Record<string, unknown> | null, fail = false) {
  const reads: string[] = []
  const db = {
    from(table: string) {
      reads.push(table)
      const chain = new Proxy({}, {
        get(_target, method: string) {
          if (method === "then") {
            return (resolve: (value: unknown) => unknown) => Promise.resolve({
              data: table === "festival_settings" ? settings : festival,
              error: fail ? { message: "unavailable" } : null,
            }).then(resolve)
          }
          return () => chain
        },
      })
      return chain
    },
  }
  const code = ts.transpileModule(source("../lib/loaders/festivals.ts"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const loaded = { exports: {} as { loadFestivalPromotion: () => Promise<{ festival: Record<string, unknown> | null }> } }
  new Function("require", "module", "exports", code)((id: string) => {
    if (id === "@/lib/supabase/server") return { createClient: async () => db }
    if (id === "@/lib/auth/roles") return { requireAppAdmin: async () => { throw Error("owner fixture unavailable") } }
    if (id === "@/lib/festivals/validation") return { validateFestivalSlug: (slug: string) => slug }
    throw Error(`Unexpected import ${id}`)
  }, loaded, loaded.exports)
  return { load: () => loaded.exports.loadFestivalPromotion(), reads }
}

test("promotion stays absent when mode is Off or the selected hub is unpublished", async () => {
  for (const settings of [{ mode_enabled: false, selected_festival_id: 7 }, { mode_enabled: true, selected_festival_id: null }]) {
    const fixture = promotionFixture(settings, { id: 7, lifecycle: "published" })
    assert.equal((await fixture.load()).festival, null)
    assert.deepEqual(fixture.reads, ["festival_settings"])
  }
  const unpublished = promotionFixture({ mode_enabled: true, selected_festival_id: 7 }, null)
  assert.equal((await unpublished.load()).festival, null)
  const unavailable = promotionFixture({ mode_enabled: true, selected_festival_id: 7 }, { id: 7 }, true)
  assert.equal((await unavailable.load()).festival, null)
})

test("promotion reads the selected published hub only when mode is On", async () => {
  const festival = { id: 7, slug: "partner-festival", lifecycle: "published" }
  const fixture = promotionFixture({ mode_enabled: true, selected_festival_id: 7 }, festival)
  assert.deepEqual((await fixture.load()).festival, festival)
  assert.deepEqual(fixture.reads, ["festival_settings", "festival_hubs"])
})

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
  const migration = source("../supabase/migrations/20260924080350_festival_hub_foundation.sql")

  assert.match(actions, /revalidatePath\("\/"\)/)
  assert.match(actions, /revalidatePath\(`\/events\/\$\{slug\}`\)/)
  assert.match(loader, /\.in\("lifecycle", \["published", "archived"\]\)/)
  assert.match(loader, /\.eq\("slug", slug\)/)
  assert.match(migration, /disable_festival_mode_after_withdrawal[\s\S]*after update of lifecycle/)
  assert.match(migration, /set mode_enabled = false[\s\S]*where selected_festival_id = new\.id and mode_enabled/)
  assert.doesNotMatch(actions, /learning_list_bookmarks[^\n]*(?:delete|update)|from\("learning_list_bookmarks"\)/)
})

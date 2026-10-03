import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import {
  FestivalValidationError,
  validateFestivalCollectionInput,
  validateFestivalHubInput,
  validateFestivalSessionInput,
  validateFestivalSettingsInput,
  validateFestivalSlug,
} from "../lib/festivals/validation.ts"

const require = createRequire(import.meta.url)
const ts = require("typescript")

function moduleFrom(path: string, dependencies: Record<string, unknown>) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const loaded = { exports: {} as Record<string, (...args: unknown[]) => Promise<unknown>> }
  new Function("require", "module", "exports", compiled)((id: string) => {
    if (id in dependencies) return dependencies[id]
    throw new Error(`Unexpected dependency ${id}`)
  }, loaded, loaded.exports)
  return loaded.exports
}

type Call = [string, ...unknown[]]
type Read = { table: string; calls: Call[] }

function database(responses: Record<string, { data: unknown; error: unknown }>) {
  const reads: Read[] = []
  return {
    reads,
    db: {
      from(table: string) {
        const read: Read = { table, calls: [] }
        reads.push(read)
        const chain = new Proxy({}, {
          get(_target, method: string) {
            if (method === "then") {
              return (resolve: (value: unknown) => unknown) => Promise.resolve(responses[table] ?? { data: null, error: null }).then(resolve)
            }
            return (...args: unknown[]) => {
              read.calls.push([method, ...args])
              return chain
            }
          },
        })
        return chain
      },
    },
  }
}

const baseHub = {
  slug: "small-festival-2027",
  name: "Small Festival",
  description: null,
  timezone: "Australia/Melbourne",
  branding_image_url: null,
  branding_alt: null,
  programme_url: null,
  programme_snapshot_date: null,
  curator_credit: null,
  curator_profile_id: null,
  lifecycle: "draft",
  editorial_order: 0,
}

test("hub validation accepts reusable records without National-specific fields", () => {
  const first = validateFestivalHubInput(baseHub)
  const second = validateFestivalHubInput({ ...baseHub, slug: "another-gathering", name: "Another Gathering" })
  assert.equal(first.slug, "small-festival-2027")
  assert.equal(second.slug, "another-gathering")
  assert.equal(first.lifecycle, "draft")
})

test("invalid slugs, URLs, branding pairs and timezones fail closed", () => {
  for (const slug of ["National Folk", "-festival", "ab", "festival/"]) {
    assert.throws(() => validateFestivalSlug(slug), FestivalValidationError)
  }
  assert.throws(() => validateFestivalHubInput({ ...baseHub, programme_url: "http://example.com" }), /invalid_programme_url/)
  assert.throws(() => validateFestivalHubInput({ ...baseHub, branding_image_url: "https://example.com/a.png" }), /incomplete_branding/)
  assert.throws(() => validateFestivalHubInput({ ...baseHub, timezone: "Australia/Nowhere" }), /invalid_timezone/)
})

test("associations require positive existing identifiers and bounded metadata", () => {
  assert.deepEqual(validateFestivalCollectionInput({ festival_id: 1, learning_list_id: 2, collection_kind: "artist" }), {
    festival_id: 1,
    learning_list_id: 2,
    collection_kind: "artist",
    display_title: null,
    display_credit: null,
    profile_id: null,
    tradition_label: null,
    editorial_order: 0,
  })
  assert.throws(() => validateFestivalCollectionInput({ festival_id: 0, learning_list_id: 2 }), /invalid_festival_id/)
  assert.throws(() => validateFestivalCollectionInput({ festival_id: 1, learning_list_id: -2 }), /invalid_learning_list_id/)
  assert.throws(() => validateFestivalCollectionInput({ festival_id: 1, learning_list_id: 2, collection_kind: "performer" }), /invalid_collection_kind/)
})

test("session validation preserves unknown times and rejects invented end-only schedules", () => {
  const unknown = validateFestivalSessionInput({ festival_id: 1, title: "Open session", needs_review: true })
  assert.equal(unknown.local_date, null)
  assert.equal(unknown.local_start_time, null)
  assert.equal(unknown.needs_review, true)
  assert.throws(() => validateFestivalSessionInput({ festival_id: 1, title: "Open session", local_end_time: "16:00" }), /end_without_start/)
  assert.throws(() => validateFestivalSessionInput({ festival_id: 1, title: "Open session", local_start_time: "25:00" }), /invalid_local_start_time/)
})

test("settings default to off and reject enabling without a selection", () => {
  assert.deepEqual(validateFestivalSettingsInput({}), { mode_enabled: false, selected_festival_id: null })
  assert.throws(() => validateFestivalSettingsInput({ mode_enabled: true }), /mode_requires_selection/)
  assert.deepEqual(validateFestivalSettingsInput({ mode_enabled: "true", selected_festival_id: "9" }), { mode_enabled: true, selected_festival_id: 9 })
})

test("promotion loader omits reserved festival state on missing or failed configuration", async () => {
  for (const response of [{ data: null, error: null }, { data: null, error: { message: "offline" } }]) {
    const fixture = database({ festival_settings: response })
    const loader = moduleFrom("../lib/loaders/festivals.ts", {
      "@/lib/supabase/server": { createClient: async () => fixture.db },
      "@/lib/auth/roles": {},
      "@/lib/festivals/validation": { validateFestivalSlug },
    })
    assert.deepEqual(await loader.loadFestivalPromotion(), {
      settings: { mode_enabled: false, selected_festival_id: null },
      festival: null,
    })
    assert.deepEqual(fixture.reads.map((read) => read.table), ["festival_settings"])
  }
})

test("public festival loader only requests published/archive hubs and public source lists", async () => {
  const fixture = database({ festival_hubs: { data: null, error: null } })
  const loader = moduleFrom("../lib/loaders/festivals.ts", {
    "@/lib/supabase/server": { createClient: async () => fixture.db },
    "@/lib/auth/roles": {},
    "@/lib/festivals/validation": { validateFestivalSlug },
  })
  assert.deepEqual(await loader.loadPublicFestivalFoundation("draft-festival"), { status: "not_found" })
  const hubRead = fixture.reads[0]
  assert.ok(hubRead.calls.some((call) => call[0] === "in" && call[1] === "lifecycle" && JSON.stringify(call[2]) === JSON.stringify(["published", "archived"])))
  const source = readFileSync(new URL("../lib/loaders/festivals.ts", import.meta.url), "utf8")
  assert.match(source, /learning_lists\.visibility[^\n]*"public"/)
  assert.match(source, /\.limit\(100\)/)
  assert.match(source, /\.limit\(200\)/)
})

test("owner-only action gate rejects moderator, user and non-owner admin before writes", async () => {
  for (const role of ["moderator", "user", "admin"] as const) {
    let writes = 0
    const actions = moduleFrom("../lib/actions/festivals.ts", {
      "next/cache": { revalidatePath() {} },
      "@/lib/auth/roles": {
        requireAppAdmin: async () => role === "admin"
          ? { adminRole: "admin", user: { id: "admin" }, supabase: { from() { writes += 1 } } }
          : Promise.reject(new Error("NOT_FOUND")),
      },
      "@/lib/festivals/validation": { validateFestivalSettingsInput },
    })
    await assert.rejects(actions.updateFestivalSettings({ mode_enabled: false }), role === "admin" ? /festival_owner_required/ : /NOT_FOUND/)
    assert.equal(writes, 0)
  }
})

test("migration enforces draft defaults, public-list visibility, owner role and atomic settings", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260924080350_festival_hub_foundation.sql", import.meta.url), "utf8")
  assert.match(sql, /lifecycle text not null default 'draft'/)
  assert.match(sql, /mode_enabled boolean not null default false/)
  assert.match(sql, /values \(true, false, null\)/)
  assert.match(sql, /l\.visibility = 'public'/)
  assert.match(sql, /role = 'owner'/)
  assert.match(sql, /festival mode requires a selected published festival/)
  assert.match(sql, /unique \(festival_id, learning_list_id\)/)
  assert.doesNotMatch(sql, /insert into public\.festival_hubs/i)
})

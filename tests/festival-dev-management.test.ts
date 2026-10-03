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

function database(responses: Record<string, { data: unknown; error: unknown }>) {
  const writes: Array<{ table: string; calls: Call[] }> = []
  return {
    writes,
    db: {
      from(table: string) {
        const record = { table, calls: [] as Call[] }
        writes.push(record)
        const chain = new Proxy({}, {
          get(_target, method: string) {
            if (method === "then") {
              return (resolve: (value: unknown) => unknown) => Promise.resolve(responses[table] ?? { data: null, error: null }).then(resolve)
            }
            return (...args: unknown[]) => {
              record.calls.push([method, ...args])
              return chain
            }
          },
        })
        return chain
      },
    },
  }
}

const validation = {
  FestivalValidationError,
  validateFestivalCollectionInput,
  validateFestivalHubInput,
  validateFestivalSessionInput,
  validateFestivalSettingsInput,
}

test("Dev manager exposes owner preview, launch controls and existing-list association editing", () => {
  const source = readFileSync(new URL("../components/dev/FestivalManager.tsx", import.meta.url), "utf8")
  assert.match(source, /Private owner preview/)
  assert.match(source, /Mode controls only the Home promotion/)
  assert.match(source, /Create private draft/)
  assert.match(source, /branding_image_url/)
  assert.match(source, /programme_snapshot_date/)
  assert.match(source, /Detach from festival/)
  assert.match(source, /\/learning-lists\/\$\{collection\.learning_list_id\}/)
})

test("owner loader requests bounded public list options and festival associations", () => {
  const source = readFileSync(new URL("../lib/loaders/festivals.ts", import.meta.url), "utf8")
  assert.match(source, /from\("festival_collections"\)/)
  assert.match(source, /from\("learning_lists"\)/)
  assert.match(source, /eq\("visibility", "public"\)/)
  assert.match(source, /\.limit\(500\)/)
})

test("detach is owner-gated before any database mutation", async () => {
  let writes = 0
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({
        adminRole: "admin",
        user: { id: "non-owner" },
        supabase: { from() { writes += 1 } },
      }),
    },
    "@/lib/festivals/validation": validation,
  })
  await assert.rejects(actions.removeFestivalCollection(4, 2), /festival_owner_required/)
  assert.equal(writes, 0)
})

test("detach deletes only the scoped association and never source list membership", async () => {
  const fixture = database({ festival_collections: { data: { id: 4 }, error: null } })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }),
    },
    "@/lib/festivals/validation": validation,
  })
  await actions.removeFestivalCollection(4, 2)
  assert.deepEqual(fixture.writes.map((write) => write.table), ["festival_collections"])
  assert.ok(fixture.writes[0].calls.some((call) => call[0] === "delete"))
  assert.ok(fixture.writes[0].calls.some((call) => call[0] === "eq" && call[1] === "id" && call[2] === 4))
  assert.ok(fixture.writes[0].calls.some((call) => call[0] === "eq" && call[1] === "festival_id" && call[2] === 2))
  assert.doesNotMatch(readFileSync(new URL("../lib/actions/festivals.ts", import.meta.url), "utf8"), /learning_list_items/)
})

test("mode-on without an eligible published selection returns a useful form error", async () => {
  const fixture = database({
    festival_settings: {
      data: null,
      error: { message: "festival mode requires a selected published festival" },
    },
  })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }),
    },
    "@/lib/festivals/validation": validation,
  })
  const form = new FormData()
  form.set("mode_enabled", "true")
  form.set("selected_festival_id", "7")
  const state = await actions.updateFestivalSettingsFromForm(
    { status: "idle", message: null, field: null },
    form
  ) as { status: string; message: string }
  assert.equal(state.status, "error")
  assert.match(state.message, /selected published festival/i)
  assert.deepEqual(fixture.writes.map((write) => write.table), ["festival_settings"])
})

test("settings form persists an off-mode selection without publishing or enabling it", async () => {
  const fixture = database({
    festival_settings: {
      data: { mode_enabled: false, selected_festival_id: 7 },
      error: null,
    },
  })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }),
    },
    "@/lib/festivals/validation": validation,
  })
  const form = new FormData()
  form.set("selected_festival_id", "7")
  const state = await actions.updateFestivalSettingsFromForm(
    { status: "idle", message: null, field: null },
    form
  ) as { status: string; message: string }
  assert.equal(state.status, "success")
  const update = fixture.writes[0].calls.find((call) => call[0] === "update")
  assert.deepEqual(update?.[1], { mode_enabled: false, selected_festival_id: 7 })
})

test("metadata edit writes the validated hub only", async () => {
  const fixture = database({ festival_hubs: { data: { id: 3, slug: "fixture-festival" }, error: null } })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }),
    },
    "@/lib/festivals/validation": validation,
  })
  const form = new FormData()
  form.set("festival_id", "3")
  form.set("name", "Fixture Festival")
  form.set("slug", "fixture-festival")
  form.set("timezone", "Australia/Melbourne")
  form.set("branding_image_url", "https://example.com/mark.png")
  form.set("branding_alt", "Fixture festival mark")
  form.set("lifecycle", "draft")
  form.set("editorial_order", "2")
  const state = await actions.updateFestivalHubFromForm(
    { status: "idle", message: null, field: null },
    form
  ) as { status: string; message: string }
  assert.equal(state.status, "success")
  assert.deepEqual(fixture.writes.map((write) => write.table), ["festival_hubs"])
  const update = fixture.writes[0].calls.find((call) => call[0] === "update")
  assert.equal((update?.[1] as Record<string, unknown>).branding_alt, "Fixture festival mark")
  assert.equal((update?.[1] as Record<string, unknown>).lifecycle, "draft")
})

test("metadata validation reports paired branding and field-specific errors", () => {
  assert.throws(
    () => validateFestivalHubInput({
      name: "Fixture Festival",
      slug: "fixture-festival",
      timezone: "Australia/Melbourne",
      branding_image_url: "https://example.com/mark.png",
    }),
    /incomplete_branding/
  )
  assert.throws(
    () => validateFestivalHubInput({
      name: "Fixture Festival",
      slug: "fixture-festival",
      timezone: "Invalid\/Zone",
    }),
    /invalid_timezone/
  )
})

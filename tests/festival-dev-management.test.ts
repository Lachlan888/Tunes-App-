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

test("Dev workflow separates the global mode switch from festival editing", () => {
  const source = readFileSync(new URL("../components/dev/FestivalManager.tsx", import.meta.url), "utf8")
  const devMode = readFileSync(new URL("../components/dev/FestivalModeControl.tsx", import.meta.url), "utf8")
  assert.match(source, /Private owner preview/)
  assert.match(devMode, /setFestivalModeFromForm/)
  assert.match(devMode, /Home feature:/)
  assert.match(source, /App-wide Home selection/)
  assert.doesNotMatch(source, /updateFestivalSettingsFromForm/)
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

test("the Dev launch summary does not read festival records for a non-owner admin", async () => {
  let reads = 0
  const loader = moduleFrom("../lib/loaders/festivals.ts", {
    "@/lib/supabase/server": { createClient: async () => { throw Error("unexpected public client") } },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({ adminRole: "admin", supabase: { from() { reads += 1 } } }),
    },
    "@/lib/festivals/validation": { validateFestivalSlug: (slug: string) => slug },
  })
  assert.equal(await loader.loadFestivalOwnerLaunch(), null)
  assert.equal(reads, 0)
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

test("owner can enable or deactivate only the selected hub through settings", async () => {
  for (const enabled of [true, false]) {
    const fixture = database({ festival_settings: { data: { mode_enabled: enabled, selected_festival_id: 7 }, error: null } })
    const actions = moduleFrom("../lib/actions/festivals.ts", {
      "next/cache": { revalidatePath() {} },
      "@/lib/auth/roles": {
        requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }),
      },
      "@/lib/festivals/validation": validation,
    })
    const form = new FormData()
    if (enabled) form.set("mode_enabled", "true")
    form.set("selected_festival_id", "7")
    const state = await actions.updateFestivalSettingsFromForm(
      { status: "idle", message: null, field: null }, form
    ) as { status: string }
    assert.equal(state.status, "success")
    assert.deepEqual(fixture.writes[0].calls.find((call) => call[0] === "update")?.[1], {
      mode_enabled: enabled,
      selected_festival_id: 7,
    })
  }
})

test("Dev mode switch updates only the mode flag and preserves the selected festival", async () => {
  const fixture = database({ festival_settings: { data: { mode_enabled: true }, error: null } })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }),
    },
    "@/lib/festivals/validation": validation,
  })
  const form = new FormData()
  form.set("mode_enabled", "true")
  const result = await actions.setFestivalModeFromForm(
    { status: "idle", message: null, field: null }, form
  ) as { status: string }
  assert.equal(result.status, "success")
  assert.deepEqual(fixture.writes[0].calls.find((call) => call[0] === "update")?.[1], {
    mode_enabled: true,
  })
})

test("selecting a festival for Home leaves mode off", async () => {
  const fixture = database({ festival_settings: { data: { mode_enabled: false, selected_festival_id: 9 }, error: null } })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": { requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }) },
    "@/lib/festivals/validation": validation,
  })
  const form = new FormData()
  form.set("festival_id", "9")
  const result = await actions.selectFestivalForHomeFromForm(
    { status: "idle", message: null, field: null }, form
  ) as { status: string }
  assert.equal(result.status, "success")
  assert.deepEqual(fixture.writes[0].calls.find((call) => call[0] === "update")?.[1], {
    mode_enabled: false,
    selected_festival_id: 9,
  })
})

test("lifecycle action changes only lifecycle, preserving saved festival details", async () => {
  const fixture = database({ festival_hubs: { data: { id: 3, slug: "partner-festival" }, error: null } })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": { requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }) },
    "@/lib/festivals/validation": validation,
  })
  const form = new FormData()
  form.set("festival_id", "3")
  form.set("lifecycle", "published")
  const result = await actions.setFestivalLifecycleFromForm(
    { status: "idle", message: null, field: null }, form
  ) as { status: string }
  assert.equal(result.status, "success")
  assert.deepEqual(fixture.writes[0].calls.find((call) => call[0] === "update")?.[1], { lifecycle: "published" })
})

test("lifecycle action rejects non-owners and invalid states before writing", async () => {
  let writes = 0
  const denied = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": { requireAppAdmin: async () => ({ adminRole: "admin", user: { id: "admin" }, supabase: { from() { writes += 1 } } }) },
    "@/lib/festivals/validation": validation,
  })
  await assert.rejects(denied.setFestivalLifecycle(3, "published"), /festival_owner_required/)
  assert.equal(writes, 0)

  const fixture = database({})
  const owner = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": { requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }) },
    "@/lib/festivals/validation": validation,
  })
  await assert.rejects(owner.setFestivalLifecycle(3, "live"), /invalid_lifecycle/)
  assert.equal(fixture.writes.length, 0)
})

test("metadata edit writes the validated hub without changing publication state", async () => {
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
  assert.equal((update?.[1] as Record<string, unknown>).lifecycle, undefined)
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

test("creating a draft returns its id so the workspace can open it", async () => {
  const fixture = database({ festival_hubs: { data: { id: 12, slug: "new-festival" }, error: null } })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": { requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }) },
    "@/lib/festivals/validation": validation,
  })
  const form = new FormData()
  form.set("name", "New Festival")
  form.set("slug", "new-festival")
  form.set("timezone", "Australia/Melbourne")
  const result = await actions.createFestivalHubFromForm(
    { status: "idle", message: null, field: null }, form
  ) as { status: string; festivalId?: number }
  assert.equal(result.status, "success")
  assert.equal(result.festivalId, 12)
})

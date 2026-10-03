import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import {
  festivalSessionDays,
  sortFestivalSessions,
  UNKNOWN_SESSION_DAY,
} from "../lib/festivals/schedule.ts"
import {
  FestivalValidationError,
  validateFestivalSessionInput,
} from "../lib/festivals/validation.ts"
import type { PublicFestivalSession } from "../lib/loaders/festivals.ts"

const require = createRequire(import.meta.url)
const ts = require("typescript")

function session(overrides: Partial<PublicFestivalSession>): PublicFestivalSession {
  return {
    id: 1,
    festival_id: 9,
    title: "Session",
    leader_name: null,
    venue: null,
    local_date: "2027-04-03",
    local_start_time: "10:00:00",
    local_end_time: null,
    status: "scheduled",
    editorial_order: 0,
    collections: [],
    ...overrides,
  }
}

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

function database(responses: Record<string, Array<{ data: unknown; error: unknown }>>) {
  const calls: Array<{ table: string; calls: Call[] }> = []
  return {
    calls,
    db: {
      from(table: string) {
        const record = { table, calls: [] as Call[] }
        calls.push(record)
        const chain = new Proxy({}, {
          get(_target, method: string) {
            if (method === "then") {
              return (resolve: (value: unknown) => unknown) => Promise.resolve(
                responses[table]?.shift() ?? { data: null, error: null }
              ).then(resolve)
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

test("schedule keeps festival-local days chronological, overlaps stable, and unknown values last", () => {
  const ordered = sortFestivalSessions([
    session({ id: 6, local_date: null, local_start_time: null }),
    session({ id: 4, local_start_time: null }),
    session({ id: 3, local_start_time: "10:00:00", editorial_order: 2 }),
    session({ id: 2, local_start_time: "10:00:00", editorial_order: 1 }),
    session({ id: 1, local_date: "2027-04-02", local_start_time: "18:00:00" }),
  ])
  assert.deepEqual(ordered.map((item) => item.id), [1, 2, 3, 4, 6])
  assert.deepEqual(festivalSessionDays(ordered), ["2027-04-02", "2027-04-03", UNKNOWN_SESSION_DAY])
})

test("session intake preserves unknown values and requires review to be explicitly cleared", () => {
  const draft = validateFestivalSessionInput({ festival_id: 9, title: "Photo entry", needs_review: "true" })
  assert.equal(draft.local_date, null)
  assert.equal(draft.local_start_time, null)
  assert.equal(draft.needs_review, true)
  assert.throws(
    () => validateFestivalSessionInput({ festival_id: 9, title: "Photo entry", local_end_time: "12:00" }),
    FestivalValidationError
  )
})

test("owner session action validates festival collection matches and writes associations through one action", async () => {
  const fixture = database({
    festival_collections: [{ data: [{ id: 10 }, { id: 11 }], error: null }],
    festival_sessions: [{ data: { id: 30 }, error: null }],
    festival_session_collections: [
      { data: null, error: null },
      { data: null, error: null },
    ],
  })
  const actions = moduleFrom("../lib/actions/festivals.ts", {
    "next/cache": { revalidatePath() {} },
    "@/lib/auth/roles": {
      requireAppAdmin: async () => ({ adminRole: "owner", user: { id: "owner" }, supabase: fixture.db }),
    },
    "@/lib/festivals/validation": { FestivalValidationError, validateFestivalSessionInput },
  })
  await actions.upsertFestivalSession({
    festival_id: 9,
    title: "Reviewed session",
    festival_collection_ids: ["10", "11"],
  })
  assert.deepEqual(fixture.calls.map((call) => call.table), [
    "festival_collections",
    "festival_sessions",
    "festival_session_collections",
    "festival_session_collections",
  ])
  const inserted = fixture.calls[3].calls.find((call) => call[0] === "insert")?.[1]
  assert.deepEqual(inserted, [
    { festival_id: 9, session_id: 30, festival_collection_id: 10, editorial_order: 0 },
    { festival_id: 9, session_id: 30, festival_collection_id: 11, editorial_order: 1 },
  ])
})

test("public schedule is hub-only, keyboard-selectable and links exact associated public lists", () => {
  const component = readFileSync(new URL("../components/events/FestivalSessions.tsx", import.meta.url), "utf8")
  const page = readFileSync(new URL("../app/events/[slug]/page.tsx", import.meta.url), "utf8")
  const loader = readFileSync(new URL("../lib/loaders/festivals.ts", import.meta.url), "utf8")
  assert.match(page, /<FestivalSessions sessions={sessions}/)
  assert.match(component, /role="tablist"/)
  assert.match(component, /ArrowRight/)
  assert.match(component, /overflow-x-auto/)
  assert.match(component, /href={`\/public-lists\/\$\{collection\.learning_list\.id\}`}/)
  assert.match(component, /Cancelled/)
  assert.match(component, /No repertoire list has been supplied/)
  assert.match(loader, /from\("festival_session_collections"\)/)
  assert.match(loader, /festival_collections\.learning_lists\.visibility", "public"/)
  assert.match(loader, /\.eq\("needs_review", false\)/)
})

test("Dev workflow records source ambiguity and keeps extracted entries held for owner review", () => {
  const source = readFileSync(new URL("../components/dev/FestivalManager.tsx", import.meta.url), "utf8")
  assert.match(source, /supplied programme photo/)
  assert.match(source, /Never guess missing information/)
  assert.match(source, /Hold for owner review/)
  assert.match(source, /defaultChecked={session\?\.needs_review \?\? true}/)
  assert.match(source, /festival_collection_ids/)
  assert.match(source, /Create review draft/)
})

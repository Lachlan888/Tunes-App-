import assert from "node:assert/strict"
import test from "node:test"
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import * as pagination from "../lib/activity-pagination.ts"

const require = createRequire(import.meta.url)
const ts = require("typescript")
const compiled = ts.transpileModule(readFileSync(new URL("../lib/loaders/friends.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText

type Row = { id: number; user_id: string; created_at: string; event_type: string; piece_id: number; learning_list_id: null; comment_id: null; metadata: null }
function event(id: number, user_id = "friend"): Row {
  return { id, user_id, created_at: "2026-09-13T10:00:00.000Z", event_type: "tune_reviewed", piece_id: id, learning_list_id: null, comment_id: null, metadata: null }
}
function fixture(rows: Row[], hidden: string[] = []) {
  const reads: { table: string; limit?: number; filters: [string, unknown[]][]; cursor?: string }[] = []
  const db = { from(table: string) {
    const read: typeof reads[number] = { table, filters: [] }; reads.push(read)
    const query = {
      select() { return query }, order() { return query },
      in(key: string, values: unknown[]) { read.filters.push([key, values]); return query },
      eq() { return query },
      limit(size: number) { read.limit = size; return query },
      or(cursor: string) { read.cursor = cursor; return query },
      then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
        let data: Record<string, unknown>[] = table === "user_activity_events" ? rows
          : table === "profiles" ? [...new Set(rows.map(row => row.user_id))].map(id => ({ id, username: id, show_repertoire_summary: !hidden.includes(id) }))
          : table === "pieces" ? rows.map(row => ({ id: row.piece_id, title: `Tune ${row.piece_id}` })) : []
        for (const [key, values] of read.filters) data = data.filter(row => values.includes(row[key]))
        if (table === "user_activity_events") {
          data = [...data].sort((a, b) => Number(b.id) - Number(a.id))
          if (read.cursor) data = data.filter(row => Number(row.id) < Number(read.cursor?.match(/id\.lt\.(\d+)/)?.[1]))
        }
        if (read.limit !== undefined) data = data.slice(0, read.limit)
        return Promise.resolve({ data, error: null }).then(resolve, reject)
      },
    }
    return query
  } }
  const loaded = { exports: {} as { loadFriendActivityPage: (db: unknown, friends: string[], user: string, limit?: number, cursor?: pagination.ActivityCursor | null) => Promise<{ items: Row[]; nextCursor: string | null }> } }
  new Function("require", "module", "exports", compiled)((id: string) => {
    if (id === "@/lib/activity-pagination") return pagination
    if (["@/lib/auth/login-redirect", "@/lib/loaders/bounded-read", "@/lib/supabase/server", "@/lib/profile-search"].includes(id)) return {}
    throw Error(`Unexpected runtime dependency ${id}`)
  }, loaded, loaded.exports)
  return { reads, run: (friends = ["friend"], cursor: pagination.ActivityCursor | null = null) => loaded.exports.loadFriendActivityPage(db, friends, "owner", undefined, cursor) }
}

test("activity cursor validates input and preserves tied timestamp IDs", () => {
  const encoded = pagination.activityCursor(event(21))
  assert.deepEqual(pagination.parseActivityCursor(encoded), { createdAt: event(21).created_at, id: 21 })
  for (const bad of ["", "bad~2", "2026-09-13T10:00:00Z~0", "2026-09-13T10:00:00Z~2~extra", "2026-09-13T10:00:00Z~2),id.gt.0"]) assert.equal(pagination.parseActivityCursor(bad), null)
})

test("feed merge deduplicates page overlap and keeps chronological ID order", () => {
  const first = Array.from({ length: 20 }, (_, i) => event(40 - i))
  const next = Array.from({ length: 20 }, (_, i) => event(22 - i))
  const merged = pagination.mergeActivityPage(first, next)
  assert.equal(merged.length, 38)
  assert.deepEqual(merged.map(row => row.id), Array.from({ length: 38 }, (_, i) => 40 - i))
})

test("activity page retains a continuation after all scanned rows are hidden", async () => {
  const rows = Array.from({ length: 20 }, (_, i) => event(40 - i, "hidden"))
  const f = fixture([...rows, event(20), event(999, "outsider")], ["hidden"])
  const first = await f.run(["friend", "hidden"])
  assert.deepEqual(first.items, [])
  assert.equal(first.nextCursor, pagination.activityCursor(event(21)))
  const second = await f.run(["friend", "hidden"], pagination.parseActivityCursor(first.nextCursor))
  assert.deepEqual(second.items.map(row => row.id), [20])
  assert.equal(second.nextCursor, null)
  assert.ok(f.reads.filter(read => read.table === "user_activity_events").every(read => read.limit === 20))
})

test("multiple friend batches still produce one bounded ordered page", async () => {
  const friends = Array.from({ length: 201 }, (_, i) => `friend-${i}`)
  const f = fixture(friends.map((friend, i) => event(i + 1, friend)))
  const page = await f.run(friends)
  assert.deepEqual(page.items.map(row => row.id), Array.from({ length: 20 }, (_, i) => 201 - i))
  assert.equal(page.nextCursor, pagination.activityCursor(event(182)))
  assert.equal(f.reads.filter(read => read.table === "user_activity_events").length, 2)
  assert.deepEqual(await f.run([]), { items: [], nextCursor: null })
})

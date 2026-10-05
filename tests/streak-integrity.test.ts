import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const ts = require("typescript")

function loadStreaks() {
  const code = ts.transpileModule(readFileSync("lib/streaks.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const loaded = { exports: {} as Record<string, unknown> }
  new Function("require", "module", "exports", code)(
    (id: string) => {
      if (id === "@/lib/review") {
        return {
          addDaysToDateOnly: (dateOnly: string, days: number) => {
            const date = new Date(`${dateOnly}T00:00:00.000Z`)
            date.setUTCDate(date.getUTCDate() + days)
            return date.toISOString().slice(0, 10)
          },
          getToday: () => "2026-10-05",
          isDueOnOrBefore: () => false,
        }
      }
      if (id === "@/lib/supabase/server") return {}
      throw new Error(`Unexpected dependency: ${id}`)
    },
    loaded,
    loaded.exports
  )
  return loaded.exports as {
    getStreakSummaryForUser: (
      db: unknown,
      userId: string
    ) => Promise<{
      current_revision_streak: number
      longest_revision_streak: number
      current_practice_streak: number
      longest_practice_streak: number
      last_reconciled_date: string | null
    }>
  }
}

test("streak reads derive current values from actual daily events without persistence", async () => {
  const reads: string[] = []
  const rows = [
    { local_date: "2026-10-03", revision_done: true, practice_done: true },
    { local_date: "2026-10-04", revision_done: true, practice_done: true },
  ]
  const db = {
    from(table: string) {
      reads.push(table)
      assert.equal(table, "user_daily_streaks")
      return {
        select() {
          return {
            eq() {
              return {
                order() {
                  return Promise.resolve({ data: rows, error: null })
                },
              }
            },
          }
        },
      }
    },
  }

  const summary = await loadStreaks().getStreakSummaryForUser(db, "owner")
  assert.deepEqual(summary, {
    current_revision_streak: 0,
    longest_revision_streak: 2,
    current_practice_streak: 0,
    longest_practice_streak: 2,
    last_reconciled_date: "2026-10-05",
  })
  assert.deepEqual(reads, ["user_daily_streaks"])
})

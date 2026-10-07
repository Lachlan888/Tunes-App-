import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import ts from "typescript"

const source = readFileSync(new URL("../lib/loaders/tune-detail/practice-history.ts", import.meta.url), "utf8")
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const loaded: { exports: Record<string, unknown> } = { exports: {} }
new Function("require", "module", "exports", compiled)(
  (id: string) => {
    if (id === "./helpers") return { mapPracticeNote: (row: unknown) => row }
    throw new Error(`Unexpected import: ${id}`)
  },
  loaded,
  loaded.exports
)

const loadTunePracticeHistory = loaded.exports.loadTunePracticeHistory as (
  client: unknown,
  userId: string,
  pieceId: number
) => Promise<{ typedReviewHistory: Array<{ outcome: string; resulting_stage: number; created_at: string }> }>

function clientWithDiaryOffReview() {
  return {
    from(table: string) {
      const rows = table === "review_events"
        ? [{ id: 41, outcome: "shaky", resulting_stage: 6, date: "2026-10-07T02:00:00Z" }]
        : []
      const result = { data: rows, error: null }
      const query = {
        select: () => query,
        eq: () => query,
        not: () => query,
        order: () => query,
        limit: () => query,
        then: (resolve: (value: typeof result) => void) => Promise.resolve(result).then(resolve),
      }
      return query
    },
  }
}

test("tune detail shows a saved formal review when Diary is disabled", async () => {
  const history = await loadTunePracticeHistory(clientWithDiaryOffReview(), "owner", 608)
  assert.deepEqual(history.typedReviewHistory, [{
    id: 41,
    outcome: "shaky",
    resulting_stage: 6,
    created_at: "2026-10-07T02:00:00Z",
  }])
})

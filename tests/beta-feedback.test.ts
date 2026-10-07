import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const ts = require("typescript")

type FeedbackResult = { status: string; message: string | null }

function loadAction({ signedIn = true, insertError = false } = {}) {
  let inserted: Record<string, unknown> | null = null
  let eventCount = 0
  const db = {
    auth: { getUser: async () => ({ data: { user: signedIn ? { id: "viewer" } : null } }) },
    from(table: string) {
      assert.equal(table, "beta_feedback")
      return {
        insert(row: Record<string, unknown>) {
          inserted = row
          return {
            select(column: string) {
              assert.equal(column, "id")
              return {
                single: async () => ({
                  data: insertError ? null : { id: 42 },
                  error: insertError ? { code: "insert_failed" } : null,
                }),
              }
            },
          }
        },
      }
    },
  }
  const source = readFileSync(new URL("../lib/actions/beta-feedback.ts", import.meta.url), "utf8")
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const loaded = { exports: {} as { submitBetaFeedback: (_previous: FeedbackResult, data: FormData) => Promise<FeedbackResult> } }
  new Function("require", "module", "exports", code)((id: string) => {
    if (id === "@/lib/supabase/server") return { createClient: async () => db }
    if (id === "@/lib/services/app-events") return { recordAppEvent: async () => { eventCount++ } }
    throw new Error(`Unexpected import ${id}`)
  }, loaded, loaded.exports)
  return { submit: (data: FormData) => loaded.exports.submitBetaFeedback({ status: "idle", message: null }, data), inserted: () => inserted, eventCount: () => eventCount }
}

function feedback(message: string, path = "/review?session=ready") {
  const data = new FormData()
  data.set("category", "broken")
  data.set("severity", "high")
  data.set("message", message)
  data.set("page_path", path)
  return data
}

test("feedback requires sign-in and a message before inserting", async () => {
  const signedOut = loadAction({ signedIn: false })
  assert.equal((await signedOut.submit(feedback("Issue"))).status, "error")
  assert.equal(signedOut.inserted(), null)

  const blank = loadAction()
  assert.match((await blank.submit(feedback("  "))).message ?? "", /Write a short note/)
  assert.equal(blank.inserted(), null)
})

test("feedback failure keeps a retryable error and no success event", async () => {
  const action = loadAction({ insertError: true })
  const originalError = console.error
  console.error = () => undefined
  try {
    const result = await action.submit(feedback("Playback failed"))
    assert.deepEqual(result, { status: "error", message: "Couldn’t send feedback. Please try again." })
    assert.equal(action.eventCount(), 0)
  } finally {
    console.error = originalError
  }
})

test("feedback success retains route context and records one event", async () => {
  const action = loadAction()
  const result = await action.submit(feedback("Playback failed"))
  assert.deepEqual(result, { status: "success", message: "Feedback sent. Thanks." })
  assert.equal(action.inserted()?.page_path, "/review?session=ready")
  assert.equal(action.inserted()?.user_id, "viewer")
  assert.equal(action.eventCount(), 1)

  const unsafe = loadAction()
  await unsafe.submit(feedback("Issue", "//outside.invalid"))
  assert.equal(unsafe.inserted()?.page_path, "/")
})

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const ts = require("typescript")

type RpcCall = { name: string; params: Record<string, unknown> }

function loadAction<T>(
  path: string,
  rpcResult: { data: unknown; error: { message: string } | null },
  sideEffects: string[]
) {
  const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const calls: RpcCall[] = []
  const supabase = {
    rpc: async (name: string, params: Record<string, unknown>) => {
      calls.push({ name, params })
      return rpcResult
    },
  }
  const loaded = { exports: {} as T }

  new Function("require", "module", "exports", compiled)((id: string) => {
    if (id === "next/navigation") return { redirect: () => undefined }
    if (id === "@/lib/review") return { getTomorrow: () => "2026-10-05" }
    if (id === "@/lib/supabase/server") return { createClient: async () => supabase }
    if (id === "@/lib/streaks") {
      return { reconcileStreaksForUser: async () => sideEffects.push("streak") }
    }
    if (id === "@/lib/services/activity-events") {
      return {
        recordStartedPracticeEvent: async () => sideEffects.push("started_practice"),
        recordMarkedKnownEvent: async () => sideEffects.push("marked_known"),
      }
    }
    if (id === "@/lib/services/composer-notifications") {
      return {
        notifyComposerTuneStartedPractice: async () => sideEffects.push("composer_notification"),
      }
    }
    throw new Error(`Unexpected import: ${id}`)
  }, loaded, loaded.exports)

  return { ...loaded.exports, calls, supabase }
}

test("Add to practice uses the owner-scoped transition without practice side effects", async () => {
  const sideEffects: string[] = []
  const fixture = loadAction<{
    startPracticeForUser: (
      client: unknown,
      pieceId: number
    ) => Promise<"started" | "already_in_practice">
  }>("../lib/actions/user-pieces.ts", { data: "started", error: null }, sideEffects)

  assert.equal(await fixture.startPracticeForUser(fixture.supabase, 42), "started")
  assert.deepEqual(fixture.calls, [
    {
      name: "enrol_piece_in_practice",
      params: { p_piece_id: 42, p_next_review_due: "2026-10-05" },
    },
  ])
  assert.deepEqual(sideEffects, [])
})

test("Known transition delegates atomically and preserves an existing result", async () => {
  const sideEffects: string[] = []
  const fixture = loadAction<{
    markPieceKnownForUser: (
      client: unknown,
      pieceId: number
    ) => Promise<"marked_known" | "already_known">
  }>("../lib/actions/known-pieces.ts", { data: "already_known", error: null }, sideEffects)

  assert.equal(await fixture.markPieceKnownForUser(fixture.supabase, 42), "already_known")
  assert.deepEqual(fixture.calls, [
    { name: "mark_piece_known", params: { p_piece_id: 42 } },
  ])
  assert.deepEqual(sideEffects, [])
})

test("transition failures stay failures instead of reporting a partial success", async () => {
  const sideEffects: string[] = []
  const fixture = loadAction<{
    startPracticeForUser: (client: unknown, pieceId: number) => Promise<unknown>
  }>(
    "../lib/actions/user-pieces.ts",
    { data: null, error: { message: "transition rejected" } },
    sideEffects
  )

  await assert.rejects(
    fixture.startPracticeForUser(fixture.supabase, 42),
    /transition rejected/
  )
  assert.deepEqual(sideEffects, [])
})

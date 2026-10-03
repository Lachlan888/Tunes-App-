import assert from "node:assert/strict"
import test from "node:test"

import {
  FRIEND_SUGGESTION_CANDIDATE_LIMIT,
  FRIEND_SUGGESTION_GRAPH_LIMIT,
  FRIEND_SUGGESTION_REPERTOIRE_LIMIT,
  loadFriendSuggestions,
  rankFriendSuggestions,
  type FriendSuggestionCandidate,
} from "../lib/loaders/friend-suggestions.ts"

type QueryCall = { table: string; method: string; args: unknown[]; select: string }

function databaseFixture(data: {
  profiles?: Record<string, unknown>[]
  identities?: Record<string, unknown>[]
  connections?: Record<string, unknown>[]
  known?: Record<string, unknown>[]
  practice?: Record<string, unknown>[]
}) {
  const calls: QueryCall[] = []

  class Query implements PromiseLike<{ data: unknown[]; error: null }> {
    private table: string
    private selectValue = ""
    private filters: Array<[string, unknown]> = []

    constructor(table: string) {
      this.table = table
    }

    select(value: string) {
      this.selectValue = value
      calls.push({ table: this.table, method: "select", args: [value], select: value })
      return this
    }

    eq(...args: unknown[]) { this.filters.push([String(args[0]), args[1]]); return this.record("eq", args) }
    neq(...args: unknown[]) { return this.record("neq", args) }
    in(...args: unknown[]) { this.filters.push([String(args[0]), args[1]]); return this.record("in", args) }
    or(...args: unknown[]) { return this.record("or", args) }
    order(...args: unknown[]) { return this.record("order", args) }
    limit(...args: unknown[]) { return this.record("limit", args) }

    private record(method: string, args: unknown[]) {
      calls.push({ table: this.table, method, args, select: this.selectValue })
      return this
    }

    then<TResult1 = { data: unknown[]; error: null }, TResult2 = never>(
      onfulfilled?: ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
      _onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
      void _onrejected
      let rows: Record<string, unknown>[] = []
      if (this.table === "profiles") {
        rows = this.selectValue === "id, display_name" ? data.identities ?? [] : data.profiles ?? []
        const ids = this.filters.find(([column]) => column === "id")?.[1]
        if (Array.isArray(ids)) rows = rows.filter((row) => ids.includes(row.id))
      } else if (this.table === "connections") {
        rows = data.connections ?? []
      } else {
        rows = this.table === "user_known_pieces" ? data.known ?? [] : data.practice ?? []
        const userId = this.filters.find(([column]) => column === "user_id")?.[1]
        if (typeof userId === "string") rows = rows.filter((row) => row.user_id === userId)
        if (Array.isArray(userId)) rows = rows.filter((row) => userId.includes(row.user_id))
      }
      return Promise.resolve({ data: rows, error: null }).then(onfulfilled)
    }
  }

  return {
    calls,
    db: { from: (table: string) => new Query(table) },
  }
}

function candidate(id: string, name: string): FriendSuggestionCandidate {
  return { id, username: name.toLowerCase(), display_name: name, canUseRepertoire: true }
}

test("ranking is deterministic for ties and explains only aggregate permitted signals", () => {
  const repertoireRows = [
    { user_id: "viewer", piece_id: 1, pieces: { style: "Irish" } },
    { user_id: "viewer", piece_id: 2, pieces: { style: "Old-time" } },
    { user_id: "a", piece_id: 1, pieces: { style: "Irish" } },
    { user_id: "b", piece_id: 2, pieces: { style: "Old-time" } },
  ]
  const ranked = rankFriendSuggestions({
    candidates: [candidate("b", "Bela"), candidate("a", "Aoife")],
    currentUserId: "viewer",
    repertoireRows,
    mutualConnectionCounts: new Map(),
  })

  assert.deepEqual(ranked.map((row) => row.id), ["a", "b"])
  assert.deepEqual(ranked.map((row) => row.score), [28, 28])
  assert.equal(ranked[0]?.reason, "You both play Irish")
  assert.doesNotMatch(JSON.stringify(ranked), /piece_id|Irish jig|Old-time reel/)
})

test("loader applies discovery eligibility before ranking and excludes every existing relationship", async () => {
  const fixture = databaseFixture({
    profiles: [
      { id: "viewer", username: "me", show_identity: true, show_compare_discoverability: true, compare_requires_friend: false },
      { id: "accepted", username: "pal", show_identity: true, show_compare_discoverability: true, compare_requires_friend: false },
      { id: "pending", username: "waiting", show_identity: true, show_compare_discoverability: true, compare_requires_friend: false },
      { id: "blocked", username: "blocked", show_identity: true, show_compare_discoverability: true, compare_requires_friend: false },
      { id: "hidden", username: "hidden", show_identity: true, show_compare_discoverability: false, compare_requires_friend: false },
      { id: "shared", username: "shared", show_identity: true, show_compare_discoverability: true, compare_requires_friend: false },
      { id: "mutual", username: "mutual", show_identity: false, show_compare_discoverability: true, compare_requires_friend: true },
    ],
    identities: [
      { id: "shared", display_name: "Shared Style" },
      { id: "mutual", display_name: "Private Name" },
    ],
    connections: [
      { requester_id: "accepted", addressee_id: "mutual", status: "accepted" },
    ],
    known: [
      { user_id: "viewer", piece_id: 11, pieces: { style: "Irish" } },
      { user_id: "shared", piece_id: 11, pieces: { style: "Irish" } },
      { user_id: "mutual", piece_id: 11, pieces: { style: "Irish" } },
    ],
  })
  const result = await loadFriendSuggestions(
    fixture.db as never,
    "viewer",
    [
      { requester_id: "viewer", addressee_id: "accepted", status: "accepted" },
      { requester_id: "viewer", addressee_id: "pending", status: "pending" },
      { requester_id: "blocked", addressee_id: "viewer", status: "blocked" },
    ]
  )

  assert.equal(result.state, "ready")
  assert.deepEqual(result.suggestions.map((row) => row.id), ["mutual", "shared"])
  assert.equal(result.suggestions[0]?.reason, "1 mutual connection")
  assert.equal(result.suggestions[0]?.display_name, null)
  assert.equal(result.suggestions[1]?.reason, "You both play Irish")
  assert.ok(result.suggestions.every((row) => !["viewer", "accepted", "pending", "blocked", "hidden"].includes(row.id)))
  const candidateRead = fixture.calls.find((call) => call.table === "profiles" && call.method === "limit" && call.select.includes("show_compare_discoverability"))
  assert.equal(candidateRead?.args[0], FRIEND_SUGGESTION_CANDIDATE_LIMIT)
  assert.ok(fixture.calls.some((call) => call.table === "profiles" && call.method === "eq" && call.args[0] === "show_compare_discoverability" && call.args[1] === true))
  assert.ok(fixture.calls.some((call) => call.table === "profiles" && call.method === "eq" && call.select === "id, display_name" && call.args[0] === "show_identity" && call.args[1] === true))
})

test("query count and row limits stay fixed as candidate count grows", async () => {
  const profiles = Array.from({ length: 60 }, (_, index) => ({
    id: `candidate-${index}`,
    username: `candidate${index}`,
    show_identity: false,
    show_compare_discoverability: true,
    compare_requires_friend: false,
  }))
  const fixture = databaseFixture({ profiles })
  const result = await loadFriendSuggestions(fixture.db as never, "viewer", [])

  assert.equal(result.state, "insufficient_signals")
  assert.deepEqual(result.suggestions, [])
  assert.equal(fixture.calls.filter((call) => call.method === "select").length, 5)
  for (const call of fixture.calls.filter((entry) => entry.method === "limit")) {
    const limit = Number(call.args[0])
    if (call.table === "profiles") assert.ok(limit <= FRIEND_SUGGESTION_CANDIDATE_LIMIT)
    if (call.table === "connections") assert.ok(limit <= FRIEND_SUGGESTION_GRAPH_LIMIT)
    if (call.table.startsWith("user_")) assert.ok(limit <= FRIEND_SUGGESTION_REPERTOIRE_LIMIT)
  }
})

test("cold start returns an honest low-data state", async () => {
  const fixture = databaseFixture({
    profiles: [{ id: "candidate", username: "newplayer", show_identity: false, show_compare_discoverability: true, compare_requires_friend: false }],
  })
  const result = await loadFriendSuggestions(fixture.db as never, "viewer", [])
  assert.deepEqual(result, { suggestions: [], state: "insufficient_signals" })
})

import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import {
  buildPieceContributionUpdates,
  PIECE_CONTRIBUTION_FIELDS,
  PieceContributionValidationError,
} from "../lib/pieces/contribution-policy.ts"
import { contributeMissingPieceDetails } from "../lib/services/piece-contributions.ts"

const migrationUrl = new URL(
  "../supabase/migrations/20260923150759_enforce_piece_contributions.sql",
  import.meta.url
)

test("field policy exposes only fill-once canonical details", () => {
  assert.deepEqual(PIECE_CONTRIBUTION_FIELDS, [
    "key",
    "style",
    "time_signature",
    "composer",
    "reference_url",
  ])
})

test("contribution input is trimmed and canonicalised", () => {
  assert.deepEqual(
    buildPieceContributionUpdates({
      key: " bb ",
      style: " Irish ",
      time_signature: " 6/8 ",
      composer: "  Trad. ",
      reference_url: " https://example.com/tune ",
    }),
    {
      key: "Bb",
      style: "Irish",
      time_signature: "6/8",
      composer: "Trad.",
      reference_url: "https://example.com/tune",
    }
  )
})

test("blank values do not clear canonical fields", () => {
  assert.deepEqual(
    buildPieceContributionUpdates({
      key: " ",
      style: null,
      composer: undefined,
    }),
    {}
  )
})

test("invalid contribution values are rejected before persistence", () => {
  for (const [field, value] of [
    ["key", "H minor"],
    ["time_signature", "common time"],
    ["reference_url", "javascript:alert(1)"],
  ] as const) {
    assert.throws(
      () => buildPieceContributionUpdates({ [field]: value }),
      (error: unknown) =>
        error instanceof PieceContributionValidationError &&
        error.field === field
    )
  }
})

test("migration enforces attribution and role checks in the database", async () => {
  const sql = await readFile(migrationUrl, "utf8")

  assert.match(sql, /primary key \(piece_id, field_name\)/)
  assert.match(sql, /v_actor uuid := \(select auth\.uid\(\)\)/)
  assert.match(sql, /v_actor_role in \('moderator', 'admin'\)/)
  assert.match(sql, /Only moderators can correct established canonical tune fields/)
  assert.match(sql, /before update on public\.pieces/)
  assert.match(sql, /insert into public\.piece_field_contributions/g)
  assert.match(sql, /insert into public\.piece_change_log/)
  assert.match(sql, /revoke all on table public\.piece_field_contributions from anon, authenticated/)
})

test("service reports saved, rejected, and empty contribution outcomes", async () => {
  function clientFor(result: { data: unknown; error: { message: string } | null }) {
    return {
      from: () => ({
        update: () => ({
          eq: () => ({
            select: () => ({
              maybeSingle: async () => result,
            }),
          }),
        }),
      }),
    }
  }

  const saved = await contributeMissingPieceDetails(
    clientFor({ data: { id: 7 }, error: null }) as never,
    7,
    { key: "d" }
  )
  assert.deepEqual(saved, { status: "saved", fields: ["key"] })

  const rejected = await contributeMissingPieceDetails(
    clientFor({ data: null, error: { message: "Tune key is already filled" } }) as never,
    7,
    { key: "D" }
  )
  assert.deepEqual(rejected, {
    status: "rejected",
    fields: ["key"],
    message: "Tune key is already filled",
  })

  const empty = await contributeMissingPieceDetails(
    clientFor({ data: null, error: null }) as never,
    7,
    { composer: " " }
  )
  assert.deepEqual(empty, { status: "empty", fields: [] })
})

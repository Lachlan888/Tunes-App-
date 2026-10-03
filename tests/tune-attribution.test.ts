import assert from "node:assert/strict"
import test from "node:test"
import { toAttributionPerson } from "../lib/loaders/tune-detail/attribution.ts"

test("attribution links only identities that expose a public username", () => {
  assert.deepEqual(
    toAttributionPerson({
      id: "public-user",
      username: "session_player",
      display_name: "Session Player",
      show_identity: true,
    }),
    { displayName: "Session Player", username: "session_player" }
  )

  assert.deepEqual(
    toAttributionPerson({
      id: "private-user",
      username: "hidden",
      display_name: "Hidden Name",
      show_identity: false,
    }),
    { displayName: "Private player", username: null }
  )

  assert.deepEqual(toAttributionPerson(null), {
    displayName: "Unknown player",
    username: null,
  })
})

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import manifest from "../app/manifest.ts"

const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8")

test("the installable manifest stays app-scoped without claiming private offline support", () => {
  const value = manifest()

  assert.equal(value.start_url, "/")
  assert.equal(value.scope, "/")
  assert.equal(value.display, "standalone")
  assert.ok(value.icons?.some((icon) => icon.src === "/tunes-icon.svg"))

  const layout = source("../app/layout.tsx")
  assert.doesNotMatch(layout, /serviceWorker\.register|navigator\.serviceWorker/)
})

test("offline status is honest about retained local work and rejected writes", () => {
  const connectionStatus = source("../components/resilience/ConnectionStatus.tsx")
  const practice = source("../components/practice/FocusedPracticeSession.tsx")

  assert.match(connectionStatus, /Offline\. Keep this page open/)
  assert.match(connectionStatus, /Changes are not synced; reconnect before saving/)
  assert.match(practice, /!online \|\| Boolean\(errorMessage\)/)
  assert.match(practice, /disabled=\{!online \|\| isSubmitting\}/)
  assert.match(practice, /The rating could not be saved\. Check your connection and try again\./)
})

test("logout and account replacement purge Tunes session state before navigation", () => {
  const logout = source("../components/LogoutButton.tsx")
  const provider = source("../components/resilience/PrivateSessionProvider.tsx")

  assert.match(logout, /purgeTunesSessionStorage\(\)[\s\S]*window\.location\.href = "\/login"/)
  assert.match(provider, /event === "SIGNED_OUT"/)
  assert.match(provider, /event === "SIGNED_IN" && session\?\.user\.id !== userId/)
  assert.match(provider, /purgeTunesSessionStorage\(\)[\s\S]*window\.location\.replace\("\/login"\)/)
})

test("practice retry reuses one submission key and the database returns the prior result", () => {
  const practice = source("../components/practice/FocusedPracticeSession.tsx")
  const action = source("../lib/actions/reviews.ts")
  const foundationMigration = source("../supabase/migrations/20260607000000_complete_formal_review_rpc.sql")
  const migration = source("../supabase/migrations/20260607010000_fix_complete_formal_review_piece_id_ambiguity.sql")

  assert.match(practice, /failedSubmission\.current\?\.formData \?\? new FormData\(\)/)
  assert.match(practice, /failedSubmission\.current = \{ pending, formData \}/)
  assert.match(practice, /reviewSubmissionKey", pending\.submissionKey/)
  assert.match(action, /p_submission_key: submissionKey/)
  assert.match(foundationMigration, /unique \(user_id, submission_key\)/)
  assert.match(migration, /on conflict \(user_id, submission_key\) do nothing/)
  assert.match(migration, /select[\s\S]+false,[\s\S]+v_submission\.piece_id,[\s\S]+v_submission\.review_event_id,[\s\S]+v_submission\.moved_to_known/)
})

import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  buildAdminBroadcastEmail,
  deliverBroadcastRecipients,
  executeBroadcastOnce,
  resolveAdminTestRecipient,
  resolveBroadcastRecipients,
  validateBroadcastInput,
  type BroadcastInput,
} from "../lib/services/admin-email-broadcast-logic.ts"

const users = [
  { id: "one", email: "one@example.com" },
  { id: "two", email: "TWO@example.com" },
  { id: "duplicate", email: "two@example.com" },
  { id: "missing", email: null },
]

const baseInput: BroadcastInput = {
  audience: "all_users",
  subject: "A new weekly Tunes digest",
  heading: "Your week on Tunes",
  message: "First paragraph.\n\nSecond paragraph.",
  ctaLabel: "Manage email settings",
  ctaUrl: "/dashboard?communication_settings=open",
}

test("normal users cannot call either admin email send path", () => {
  const actionSource = readFileSync(
    new URL("../lib/actions/admin-email-broadcasts.ts", import.meta.url),
    "utf8"
  )
  const guardPosition = actionSource.indexOf("await requireAppAdmin()")
  const intentPosition = actionSource.indexOf('formData.get("intent")')

  assert.ok(guardPosition >= 0)
  assert.ok(intentPosition > guardPosition)
  assert.match(actionSource, /sendAdminEmailTest\(/)
  assert.match(actionSource, /sendAdminEmailBroadcast\(/)
})

test("All users resolves valid authoritative emails and deduplicates them", () => {
  const recipients = resolveBroadcastRecipients({
    users,
    preferences: [],
    audience: "all_users",
    defaultEmailEnabled: true,
    defaultDigestFrequency: "weekly",
  })

  assert.deepEqual(recipients, [
    { userId: "one", email: "one@example.com" },
    { userId: "two", email: "TWO@example.com" },
  ])
})

test("Digest subscribers excludes Off users and applies current defaults", () => {
  const recipients = resolveBroadcastRecipients({
    users: [
      { id: "daily", email: "daily@example.com" },
      { id: "off", email: "off@example.com" },
      { id: "disabled", email: "disabled@example.com" },
      { id: "defaults", email: "defaults@example.com" },
    ],
    preferences: [
      {
        user_id: "daily",
        email_enabled: true,
        digest_frequency: "daily",
      },
      {
        user_id: "off",
        email_enabled: true,
        digest_frequency: "never",
      },
      {
        user_id: "disabled",
        email_enabled: false,
        digest_frequency: "weekly",
      },
    ],
    audience: "digest_subscribers",
    defaultEmailEnabled: true,
    defaultDigestFrequency: "weekly",
  })

  assert.deepEqual(
    recipients.map((recipient) => recipient.userId),
    ["daily", "defaults"]
  )
})

test("test send resolves only the current admin account email", () => {
  assert.deepEqual(
    resolveAdminTestRecipient({ id: "admin", email: "admin@example.com" }),
    { userId: "admin", email: "admin@example.com" }
  )
  assert.equal(
    resolveAdminTestRecipient({ id: "admin", email: null }),
    null
  )
})

test("broadcast HTML escapes all user-entered content", () => {
  const template = buildAdminBroadcastEmail({
    input: {
      ...baseInput,
      subject: '<Subject & "quote">',
      heading: "<script>alert('heading')</script>",
      message: "Hello <img src=x onerror=alert(1)> & goodbye.",
      ctaLabel: "<Click>",
    },
    siteUrl: "https://tunes.example.com",
  })

  assert.doesNotMatch(template.htmlContent, /<script>|<img src=x|<Click>/)
  assert.match(template.htmlContent, /&lt;script&gt;/)
  assert.match(template.htmlContent, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.match(template.htmlContent, /&lt;Click&gt;/)
  assert.match(template.htmlContent, /First paragraph|Hello/)
})

test("unsafe CTA URLs are rejected", () => {
  for (const unsafeUrl of [
    "javascript:alert(1)",
    "data:text/html,bad",
    "//evil.example.com",
    "http://evil.example.com",
    "not a url",
  ]) {
    const formData = new FormData()
    formData.set("audience", "all_users")
    formData.set("subject", "Subject")
    formData.set("message", "Message")
    formData.set("cta_label", "Click")
    formData.set("cta_url", unsafeUrl)

    const result = validateBroadcastInput(formData)
    assert.equal(result.ok, false, unsafeUrl)
  }
})

test("one recipient failure does not abort remaining recipients", async () => {
  const attempted: string[] = []
  const result = await deliverBroadcastRecipients(
    [
      { userId: "one", email: "one@example.com" },
      { userId: "two", email: "two@example.com" },
      { userId: "three", email: "three@example.com" },
    ],
    async (recipient) => {
      attempted.push(recipient.userId)
      if (recipient.userId === "two") throw new Error("Provider failure")
      return "sent"
    },
    2
  )

  assert.deepEqual(new Set(attempted), new Set(["one", "two", "three"]))
  assert.deepEqual(result, {
    total: 3,
    sent: 2,
    failed: 1,
    skipped: 0,
  })
})

test("a claimed broadcast ID cannot execute twice", async () => {
  let claimed = false
  let executions = 0
  const run = () =>
    executeBroadcastOnce({
      claim: async () => {
        if (claimed) return false
        claimed = true
        return true
      },
      execute: async () => {
        executions += 1
        return "sent"
      },
    })

  assert.deepEqual(await run(), { duplicate: false, result: "sent" })
  assert.deepEqual(await run(), { duplicate: true, result: null })
  assert.equal(executions, 1)
})

test("broadcast result counts include sent, failed, and skipped outcomes", async () => {
  const statuses = new Map<string, "sent" | "failed" | "skipped">([
    ["one", "sent"],
    ["two", "failed"],
    ["three", "skipped"],
  ] as const)
  const result = await deliverBroadcastRecipients(
    [
      { userId: "one", email: "one@example.com" },
      { userId: "two", email: "two@example.com" },
      { userId: "three", email: "three@example.com" },
    ],
    async (recipient) => statuses.get(recipient.userId) ?? "failed"
  )

  assert.deepEqual(result, {
    total: 3,
    sent: 1,
    failed: 1,
    skipped: 1,
  })
})

test("migration stores history and delivery metadata without email bodies", () => {
  const migration = readFileSync(
    new URL(
      "../supabase/migrations/20260822010000_create_admin_email_broadcasts.sql",
      import.meta.url
    ),
    "utf8"
  )

  assert.match(migration, /create table if not exists public\.admin_email_broadcasts/)
  assert.match(migration, /id uuid primary key/)
  assert.match(migration, /add column if not exists subject text/)
  assert.match(migration, /admin_broadcast_id uuid/)
  assert.match(migration, /product_update/)
  assert.doesNotMatch(migration, /email_delivery_log[\s\S]*html_content/)
})

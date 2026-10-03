import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import test from "node:test"

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8")

function tokenHex(name: string) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`))
  assert.ok(match, `Expected --${name} to be a six-digit hex token`)
  return match[1]
}

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    )

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrast(first: string, second: string) {
  const light = Math.max(luminance(first), luminance(second))
  const dark = Math.min(luminance(first), luminance(second))
  return (light + 0.05) / (dark + 0.05)
}

test("foundation tokens keep the specified semantic values", () => {
  assert.deepEqual(
    {
      canvas: tokenHex("surface-canvas").toUpperCase(),
      paper: tokenHex("surface-paper").toUpperCase(),
      note: tokenHex("surface-note").toUpperCase(),
      ink: tokenHex("text-primary").toUpperCase(),
      mutedInk: tokenHex("text-muted").toUpperCase(),
      hairline: tokenHex("hairline").toUpperCase(),
      umber: tokenHex("action-primary").toUpperCase(),
      umberHover: tokenHex("action-primary-hover").toUpperCase(),
      moss: tokenHex("state-known").toUpperCase(),
      river: tokenHex("state-practice").toUpperCase(),
      ochre: tokenHex("state-due").toUpperCase(),
      rust: tokenHex("state-overdue").toUpperCase(),
      plum: tokenHex("state-social").toUpperCase(),
      oxblood: tokenHex("action-destructive").toUpperCase(),
    },
    {
      canvas: "#F4EFE4",
      paper: "#FFFDF8",
      note: "#E9E1D3",
      ink: "#25231F",
      mutedInk: "#675F55",
      hairline: "#D3C7B5",
      umber: "#5B4325",
      umberHover: "#49351D",
      moss: "#68754A",
      river: "#466A78",
      ochre: "#C18B32",
      rust: "#A9533E",
      plum: "#755B72",
      oxblood: "#8E3934",
    }
  )
})

test("ordinary text and filled semantic controls meet WCAG AA contrast", () => {
  const pairings = [
    ["ink on paper", "text-primary", "surface-paper"],
    ["muted ink on paper", "text-muted", "surface-paper"],
    ["muted ink on note", "text-muted", "surface-note"],
    ["paper on primary action", "surface-paper", "action-primary"],
    ["paper on known", "surface-paper", "state-known"],
    ["paper on practice", "surface-paper", "state-practice"],
    ["ink on due", "text-primary", "state-due"],
    ["paper on overdue", "surface-paper", "state-overdue"],
    ["paper on social", "surface-paper", "state-social"],
    ["paper on destructive", "surface-paper", "action-destructive"],
  ] as const

  for (const [label, foreground, background] of pairings) {
    const ratio = contrast(tokenHex(foreground), tokenHex(background))
    assert.ok(ratio >= 4.5, `${label} is ${ratio.toFixed(2)}:1, below 4.5:1`)
  }
})

test("accessibility preference fallbacks are defined", () => {
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
  assert.match(css, /prefers-reduced-transparency:\s*reduce/)
  assert.match(css, /prefers-contrast:\s*more/)
  assert.match(css, /forced-colors:\s*active/)
})

test("reference loop controls keep named groups and 44px phone targets", () => {
  const player = readFileSync(
    join(process.cwd(), "components/library/YouTubeLoopPlayer.tsx"),
    "utf8"
  )

  assert.match(player, /role="group" aria-label="Loop pedal controls"/)
  assert.match(player, /role="group" aria-label="Loop range controls"/)
  assert.match(player, /aria-pressed=\{isPlaying\}/)
  assert.match(player, /className="min-h-11 min-w-11 rounded-md border/)
  assert.match(player, /joinClasses\("min-h-11 min-w-11 rounded-md border px-3/)
  assert.match(player, /className="grid h-11 w-11 place-items-center/)
})

test("visible practice navigation uses the source-of-truth Focus areas name", () => {
  const accountMenu = readFileSync(
    join(process.cwd(), "components/layout/AccountMenu.tsx"),
    "utf8"
  )

  assert.match(accountMenu, /label: "Focus areas"/)
  assert.doesNotMatch(accountMenu, /label: "Focus Areas"/)
})

test("named status and control containers expose semantics instead of labelling generic elements", () => {
  const setlistCard = readFileSync(
    join(process.cwd(), "components/setlists/SetlistOverviewCard.tsx"),
    "utf8"
  )
  const tuneActions = readFileSync(
    join(process.cwd(), "components/library/TuneDetailActions.tsx"),
    "utf8"
  )
  const sessionDockShowcase = readFileSync(
    join(process.cwd(), "components/session-dock/SessionDockShowcase.tsx"),
    "utf8"
  )

  assert.match(setlistCard, /role="group" aria-label="Your private readiness"/)
  assert.match(tuneActions, /role="status"[^>]+aria-label="This tune is marked as known"/)
  assert.match(sessionDockShowcase, /role="group" aria-label="Session Dock preview context"/)
})

test("design guidance prohibits decorative eyebrow labels", () => {
  const direction = readFileSync(
    join(
      process.cwd(),
      "docs/Tunes App — Full UI/UX Audit and 2026 Product Design Direction.md"
    ),
    "utf8"
  )
  const context = readFileSync(
    join(process.cwd(), "docs/Tunes-App-Current-Context.md"),
    "utf8"
  )

  assert.match(direction, /Do not use decorative eyebrow labels/)
  assert.match(context, /decorative eyebrow labels are prohibited/)
  assert.match(context, /Begin with the real heading/)
})

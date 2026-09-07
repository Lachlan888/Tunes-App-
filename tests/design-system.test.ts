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

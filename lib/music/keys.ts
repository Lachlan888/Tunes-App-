export const KEY_ROOTS = [
  "A",
  "Bb",
  "B",
  "C",
  "C#",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "Ab",
] as const

export const VALID_KEYS = KEY_ROOTS.flatMap((root) => [
  root,
  `${root}m`,
  `${root} Modal`,
]) as string[]

export const KEY_OPTIONS = ["", ...VALID_KEYS] as const

export type KeyRoot = (typeof KEY_ROOTS)[number]
export type KeyTonality = "major" | "minor" | "modal"

export type ParsedKeyValue = {
  root: KeyRoot
  tonality: KeyTonality
}

function canonicaliseKey(input: string): string {
  return input.trim().replace(/\s+/g, " ")
}

export function normaliseKey(input: string | null | undefined): string | null {
  if (!input) return null

  const cleaned = canonicaliseKey(input)
  const lower = cleaned.toLowerCase()

  for (const validKey of VALID_KEYS) {
    if (validKey.toLowerCase() === lower) {
      return validKey
    }
  }

  return null
}

export function isValidKey(input: string | null | undefined): boolean {
  return normaliseKey(input) !== null
}

export function formatKeyValue(
  root: KeyRoot | "",
  tonality: KeyTonality
): string {
  if (!root) return ""
  if (tonality === "minor") return `${root}m`
  if (tonality === "modal") return `${root} Modal`
  return root
}

export function parseKeyValue(
  input: string | null | undefined
): ParsedKeyValue | null {
  const normalised = normaliseKey(input)

  if (!normalised) return null

  if (normalised.endsWith(" Modal")) {
    const root = normalised.replace(/ Modal$/, "") as KeyRoot
    return KEY_ROOTS.includes(root) ? { root, tonality: "modal" } : null
  }

  if (normalised.endsWith("m")) {
    const root = normalised.slice(0, -1) as KeyRoot
    return KEY_ROOTS.includes(root) ? { root, tonality: "minor" } : null
  }

  const root = normalised as KeyRoot
  return KEY_ROOTS.includes(root) ? { root, tonality: "major" } : null
}

export function isSupportedKeyValue(input: string | null | undefined): boolean {
  return parseKeyValue(input) !== null
}

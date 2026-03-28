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
import { createHash, randomBytes, randomInt } from "node:crypto"

export const COMPARE_INVITE_RANDOM_BYTES = 32
export const COMPARE_INVITE_LIFETIME_MS = 10 * 60 * 1000
export const COMPARE_INVITE_ALIAS_WORD_COUNT = 3

export const COMPARE_INVITE_ALIAS_WORDS = [
  "amber", "anthem", "archer", "banjo", "baritone", "birch", "bow", "brass",
  "bridge", "bright", "cadence", "cedar", "cello", "chime", "chorus", "clover",
  "concert", "copper", "cypress", "dance", "dobro", "drift", "drum", "echo",
  "encore", "fiddle", "flute", "folk", "forest", "frets", "gibson", "golden",
  "groove", "harmony", "harp", "hazel", "hickory", "horn", "indigo", "jangle",
  "jazz", "laurel", "lyric", "mandolin", "maple", "melody", "moon", "morris",
  "music", "octave", "orchard", "organ", "pearl", "pick", "pine", "reel",
  "rhythm", "river", "robin", "rosewood", "round", "session", "silver", "song",
  "spruce", "stage", "steel", "strings", "studio", "sunset", "tempo", "tenor",
  "tune", "valley", "verse", "vinyl", "walnut", "waltz", "willow", "woodwind",
  "acoustic", "bluegrass", "bourbon", "concertina", "flatpick", "fretboard", "jam",
  "luthier", "mastertone", "monroe", "parlor", "plectrum", "resonator", "soundhole",
  "tonewood", "tremolo",
] as const

export const COMPARE_INVITE_ALIAS_SPACE =
  COMPARE_INVITE_ALIAS_WORDS.length ** COMPARE_INVITE_ALIAS_WORD_COUNT

export type CompareInviteTimestampRow = {
  accepted_at: string | null
  revoked_at: string | null
  expires_at: string
}

export type CompareInviteLifecycleState =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired"

export function createCompareInviteToken() {
  return randomBytes(COMPARE_INVITE_RANDOM_BYTES).toString("base64url")
}

export function isValidCompareInviteToken(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token)
}

export function hashCompareInviteToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

export type CompareInviteAlias = {
  code: string
  key: string
}

function titleCaseWord(word: string) {
  return `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`
}

export function normaliseCompareInviteAlias(code: string) {
  const words = code
    .trim()
    .toLowerCase()
    .split(/[\s-]+/)
    .filter(Boolean)

  if (words.length !== COMPARE_INVITE_ALIAS_WORD_COUNT) return null
  if (words.some((word) => !COMPARE_INVITE_ALIAS_WORDS.includes(word as never))) {
    return null
  }

  return words.join("-")
}

export function formatCompareInviteAlias(code: string) {
  const key = normaliseCompareInviteAlias(code)
  if (!key) return code.trim()
  return key.split("-").map(titleCaseWord).join(" ")
}

export function createCompareInviteAlias(
  pickIndex: (max: number) => number = randomInt
): CompareInviteAlias {
  const words = Array.from(
    { length: COMPARE_INVITE_ALIAS_WORD_COUNT },
    () => COMPARE_INVITE_ALIAS_WORDS[pickIndex(COMPARE_INVITE_ALIAS_WORDS.length)]
  )
  const key = words.join("-")

  return {
    key,
    code: words.map(titleCaseWord).join(" "),
  }
}

export function getCompareInviteLookup(rawCode: string) {
  const token = rawCode.replace(/\s+/g, "").trim()
  if (isValidCompareInviteToken(token)) {
    return { kind: "token" as const, key: hashCompareInviteToken(token) }
  }

  const aliasKey = normaliseCompareInviteAlias(rawCode)
  if (!aliasKey) return null
  return { kind: "alias" as const, key: aliasKey }
}

export function formatCompareInviteCode(token: string) {
  return token.match(/.{1,5}/g)?.join(" ") ?? token
}

export function normaliseCompareInviteCode(code: string) {
  const token = code.replace(/\s+/g, "").trim()
  if (isValidCompareInviteToken(token)) return token
  return normaliseCompareInviteAlias(code)
}

export function deriveCompareInviteState(
  invite: CompareInviteTimestampRow,
  now = new Date()
): CompareInviteLifecycleState {
  if (invite.accepted_at) return "accepted"
  if (invite.revoked_at) return "revoked"
  if (new Date(invite.expires_at).getTime() <= now.getTime()) return "expired"
  return "pending"
}

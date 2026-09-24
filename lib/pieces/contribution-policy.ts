import { normaliseKey } from "../music/keys.ts"
import { isValidOptionalTimeSignature } from "../music/time-signatures.ts"

export const PIECE_CONTRIBUTION_FIELDS = [
  "key",
  "style",
  "time_signature",
  "composer",
  "reference_url",
] as const

export type PieceContributionField =
  (typeof PIECE_CONTRIBUTION_FIELDS)[number]

export type PieceContributionInput = Partial<
  Record<PieceContributionField, string | null | undefined>
>

export type PieceContributionUpdates = Partial<
  Record<PieceContributionField, string>
>

export class PieceContributionValidationError extends Error {
  readonly field: PieceContributionField

  constructor(
    field: PieceContributionField,
    message: string
  ) {
    super(message)
    this.name = "PieceContributionValidationError"
    this.field = field
  }
}

function requireHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function buildPieceContributionUpdates(
  input: PieceContributionInput
): PieceContributionUpdates {
  const updates: PieceContributionUpdates = {}

  for (const field of PIECE_CONTRIBUTION_FIELDS) {
    const value = input[field]?.trim() ?? ""
    if (!value) continue

    if (field === "key") {
      const key = normaliseKey(value)
      if (!key) {
        throw new PieceContributionValidationError(field, "Invalid tune key")
      }
      updates.key = key
      continue
    }

    if (field === "time_signature") {
      if (!isValidOptionalTimeSignature(value)) {
        throw new PieceContributionValidationError(
          field,
          "Invalid time signature"
        )
      }
      updates.time_signature = value
      continue
    }

    if (field === "reference_url") {
      if (!requireHttpUrl(value) || value.length > 2048) {
        throw new PieceContributionValidationError(
          field,
          "Invalid reference URL"
        )
      }
      updates.reference_url = value
      continue
    }

    if (field === "composer" && value.length > 500) {
      throw new PieceContributionValidationError(
        field,
        "Composer attribution is too long"
      )
    }

    updates[field] = value
  }

  return updates
}

import type { SupabaseClient } from "@supabase/supabase-js"
import {
  buildPieceContributionUpdates,
  PieceContributionValidationError,
  type PieceContributionField,
  type PieceContributionInput,
} from "../pieces/contribution-policy.ts"

export type PieceContributionResult =
  | { status: "empty"; fields: [] }
  | { status: "saved"; fields: PieceContributionField[] }
  | {
      status: "rejected"
      fields: PieceContributionField[]
      message: string
    }

export async function contributeMissingPieceDetails(
  supabase: SupabaseClient,
  pieceId: number,
  input: PieceContributionInput
): Promise<PieceContributionResult> {
  let updates

  try {
    updates = buildPieceContributionUpdates(input)
  } catch (error) {
    if (error instanceof PieceContributionValidationError) {
      return {
        status: "rejected",
        fields: [error.field],
        message: error.message,
      }
    }

    throw error
  }

  const fields = Object.keys(updates) as PieceContributionField[]

  if (fields.length === 0) {
    return { status: "empty", fields: [] }
  }

  const { data, error } = await supabase
    .from("pieces")
    .update(updates)
    .eq("id", pieceId)
    .select("id")
    .maybeSingle()

  if (error || !data) {
    return {
      status: "rejected",
      fields,
      message: error?.message ?? "Tune contribution was not saved",
    }
  }

  return { status: "saved", fields }
}

import type { SupabaseClient } from "@supabase/supabase-js"
import {
  buildPieceContributionUpdates,
  type PieceContributionInput,
} from "../pieces/contribution-policy.ts"

export type PieceContributionResult =
  | { status: "empty"; fields: [] }
  | { status: "saved"; fields: string[] }
  | { status: "rejected"; fields: string[]; message: string }

export async function contributeMissingPieceDetails(
  supabase: SupabaseClient,
  pieceId: number,
  input: PieceContributionInput
): Promise<PieceContributionResult> {
  const updates = buildPieceContributionUpdates(input)
  const fields = Object.keys(updates)

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

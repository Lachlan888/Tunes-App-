"use server"

import {
  getNextReviewDateFromStage,
  getNextStageForFailed,
  getNextStageForShaky,
  getNextStageForSolid,
} from "@/lib/review"
import { reconcileStreaksForUser } from "@/lib/streaks"
import { createClient } from "@/lib/supabase/server"
import { recordTuneReviewedEvent } from "@/lib/activity-events"
import { redirect } from "next/navigation"

async function recordReview(
  formData: FormData,
  outcome: "solid" | "shaky" | "failed"
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const userPieceId = Number(formData.get("userPieceId"))

  const { data: userPiece, error: fetchError } = await supabase
    .from("user_pieces")
    .select("id, user_id, piece_id, stage")
    .eq("id", userPieceId)
    .eq("user_id", user.id)
    .single()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const newStage =
    outcome === "solid"
      ? getNextStageForSolid(userPiece.stage)
      : outcome === "shaky"
        ? getNextStageForShaky(userPiece.stage)
        : getNextStageForFailed(userPiece.stage)

  const nextReviewDue = getNextReviewDateFromStage(newStage)

  const { error: updateError } = await supabase
    .from("user_pieces")
    .update({
      stage: newStage,
      next_review_due: nextReviewDue,
      status: "learning",
    })
    .eq("id", userPieceId)
    .eq("user_id", user.id)

  if (updateError) {
    throw new Error(updateError.message)
  }

  const { error: reviewEventError } = await supabase.from("review_events").insert({
    user_piece_id: userPieceId,
    outcome,
    resulting_stage: newStage,
  })

  if (reviewEventError) {
    throw new Error(reviewEventError.message)
  }

  await recordTuneReviewedEvent(user.id, userPiece.piece_id)
  await reconcileStreaksForUser(supabase, user.id, {
    markPracticeActivity: true,
  })

  redirect("/review")
}

export async function markSolid(formData: FormData) {
  await recordReview(formData, "solid")
}

export async function markShaky(formData: FormData) {
  await recordReview(formData, "shaky")
}

export async function markFailed(formData: FormData) {
  await recordReview(formData, "failed")
}
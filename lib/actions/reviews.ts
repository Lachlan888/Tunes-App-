"use server"

import { redirect } from "next/navigation"
import { markPieceKnownForUser } from "@/lib/actions/known-pieces"
import { recordTuneReviewedEvent } from "@/lib/activity-events"
import {
  getMaxPracticeStage,
  getNextReviewDateFromStage,
  getNextStageForFailed,
  getNextStageForShaky,
  getNextStageForSolid,
} from "@/lib/review"
import { reconcileStreaksForUser } from "@/lib/streaks"
import { createClient } from "@/lib/supabase/server"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

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
  const redirectTo = String(formData.get("redirectTo") || "/review")

  const { data: userPiece, error: fetchError } = await supabase
    .from("user_pieces")
    .select("id, user_id, piece_id, stage")
    .eq("id", userPieceId)
    .eq("user_id", user.id)
    .single()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const currentStage =
    userPiece.stage && userPiece.stage > 0 ? userPiece.stage : 1

  const newStage =
    outcome === "solid"
      ? getNextStageForSolid(currentStage)
      : outcome === "shaky"
        ? getNextStageForShaky(currentStage)
        : getNextStageForFailed(currentStage)

  const shouldMoveToKnown =
    outcome === "solid" && newStage >= getMaxPracticeStage()

  if (!shouldMoveToKnown) {
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
  }

  const { error: reviewEventError } = await supabase.from("review_events").insert({
    user_piece_id: userPieceId,
    outcome,
    resulting_stage: newStage,
  })

  if (reviewEventError) {
    throw new Error(reviewEventError.message)
  }

  if (shouldMoveToKnown) {
    await markPieceKnownForUser(supabase, user.id, userPiece.piece_id)
  }

  await recordTuneReviewedEvent(user.id, userPiece.piece_id)
  await reconcileStreaksForUser(supabase, user.id, {
    markPracticeActivity: true,
  })

  if (shouldMoveToKnown) {
    redirect(appendQueryParam(redirectTo, "practice_update", "moved_to_known"))
  }

  redirect(redirectTo)
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
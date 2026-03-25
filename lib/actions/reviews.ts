"use server"

import {
  getNextReviewDateFromStage,
  getNextStageForShaky,
  getNextStageForSolid,
} from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function markSolid(formData: FormData) {
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
    .select("id, user_id, stage")
    .eq("id", userPieceId)
    .eq("user_id", user.id)
    .single()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const newStage = getNextStageForSolid(userPiece.stage)
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

  const { error: reviewEventError } = await supabase
    .from("review_events")
    .insert({
      user_piece_id: userPieceId,
      outcome: "solid",
      resulting_stage: newStage,
    })

  if (reviewEventError) {
    throw new Error(reviewEventError.message)
  }

  redirect("/")
}

export async function markShaky(formData: FormData) {
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
    .select("id, user_id, stage")
    .eq("id", userPieceId)
    .eq("user_id", user.id)
    .single()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const newStage = getNextStageForShaky(userPiece.stage)
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

  const { error: reviewEventError } = await supabase
    .from("review_events")
    .insert({
      user_piece_id: userPieceId,
      outcome: "shaky",
      resulting_stage: newStage,
    })

  if (reviewEventError) {
    throw new Error(reviewEventError.message)
  }

  redirect("/")
}
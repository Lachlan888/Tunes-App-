"use server"

import { redirect } from "next/navigation"
import { markPieceKnownForUser } from "@/lib/actions/known-pieces"
import { recordTuneReviewedEvent } from "@/lib/services/activity-events"
import {
  recordFormalReviewPracticeEvent,
  recordPracticeNote,
} from "@/lib/services/practice-diary"
import {
  addDaysToDateOnly,
  getMaxPracticeStage,
  getNextReviewDateFromStage,
  getNextStageForFailed,
  getNextStageForShaky,
  getNextStageForSolid,
  getToday,
  normaliseStoredDate,
} from "@/lib/review"
import { reconcileStreaksForUser } from "@/lib/streaks"
import { createClient } from "@/lib/supabase/server"

const BACKLOG_RECOVERY_DAILY_CAP = 5

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function getOptionalPositiveNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null
  }

  return numberValue
}

async function countPracticeTunesDueOnDate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  candidateDate: string,
  currentUserPieceId: number
) {
  const { count, error } = await supabase
    .from("user_pieces")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "learning")
    .eq("next_review_due", candidateDate)
    .neq("id", currentUserPieceId)

  if (error) {
    throw new Error(error.message)
  }

  return count ?? 0
}

async function findAvailableRecoveryDate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  currentUserPieceId: number,
  baseDate: string
) {
  let candidateDate = baseDate

  while (true) {
    const dueCount = await countPracticeTunesDueOnDate(
      supabase,
      userId,
      candidateDate,
      currentUserPieceId
    )

    if (dueCount < BACKLOG_RECOVERY_DAILY_CAP) {
      return candidateDate
    }

    candidateDate = addDaysToDateOnly(candidateDate, 1)
  }
}

async function getValidActiveFocusId({
  supabase,
  userId,
  focusId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  focusId: number | null
}) {
  if (!focusId) {
    return null
  }

  const { data, error } = await supabase
    .from("practice_foci")
    .select("id")
    .eq("id", focusId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data?.id ?? null
}

async function ensureTuneIsInFocus({
  supabase,
  userId,
  focusId,
  pieceId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  focusId: number
  pieceId: number
}) {
  const { error } = await supabase.from("practice_focus_tunes").upsert(
    {
      user_id: userId,
      focus_id: focusId,
      piece_id: pieceId,
    },
    {
      onConflict: "focus_id,piece_id",
      ignoreDuplicates: true,
    }
  )

  if (error) {
    throw new Error(error.message)
  }
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
  const noteBody = String(formData.get("practice_note") ?? "").trim()
  const categoryId = getOptionalPositiveNumber(formData.get("category_id"))
  const requestedFocusId = getOptionalPositiveNumber(formData.get("focus_id"))
  const shouldAddTuneToFocus =
    String(formData.get("add_tune_to_focus") ?? "") === "on"

  const { data: userPiece, error: fetchError } = await supabase
    .from("user_pieces")
    .select("id, user_id, piece_id, stage, next_review_due")
    .eq("id", userPieceId)
    .eq("user_id", user.id)
    .single()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  const focusId = await getValidActiveFocusId({
    supabase,
    userId: user.id,
    focusId: requestedFocusId,
  })

  if (focusId && shouldAddTuneToFocus) {
    await ensureTuneIsInFocus({
      supabase,
      userId: user.id,
      focusId,
      pieceId: userPiece.piece_id,
    })
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

  const today = getToday()
  const existingDueDate = normaliseStoredDate(userPiece.next_review_due)
  const wasOverdueBeforeReview = Boolean(
    existingDueDate && existingDueDate < today
  )

  if (!shouldMoveToKnown) {
    const baseNextReviewDue = getNextReviewDateFromStage(newStage)

    const nextReviewDue = wasOverdueBeforeReview
      ? await findAvailableRecoveryDate(
          supabase,
          user.id,
          userPieceId,
          baseNextReviewDue
        )
      : baseNextReviewDue

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

  const { data: reviewEvent, error: reviewEventError } = await supabase
    .from("review_events")
    .insert({
      user_piece_id: userPieceId,
      outcome,
      resulting_stage: newStage,
    })
    .select("id")
    .single()

  if (reviewEventError) {
    throw new Error(reviewEventError.message)
  }

  const practiceEvent = await recordFormalReviewPracticeEvent({
    supabase,
    userId: user.id,
    pieceId: userPiece.piece_id,
    reviewEventId: reviewEvent.id,
  })

  if (practiceEvent && noteBody !== "") {
    await recordPracticeNote({
      supabase,
      userId: user.id,
      practiceDayId: practiceEvent.practice_day_id,
      practiceEventId: practiceEvent.id,
      pieceId: userPiece.piece_id,
      reviewEventId: reviewEvent.id,
      categoryId,
      focusId,
      body: noteBody,
    })
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
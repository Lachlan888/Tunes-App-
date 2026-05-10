import { getToday } from "@/lib/review"
import type { SupabaseServerClient } from "@/lib/auth/session"
import type { PracticeDay, PracticeEvent } from "@/lib/types"

type EnsurePracticeDayForDateParams = {
  supabase: SupabaseServerClient
  userId: string
  practiceDate: string
}

type RecordFormalReviewPracticeEventParams = {
  supabase: SupabaseServerClient
  userId: string
  pieceId: number
  reviewEventId: number
}

type RecordPracticeNoteParams = {
  supabase: SupabaseServerClient
  userId: string
  practiceDayId: number
  body: string
  practiceEventId?: number | null
  pieceId?: number | null
  reviewEventId?: number | null
  categoryId?: number | null
}

export async function ensurePracticeDayForDate({
  supabase,
  userId,
  practiceDate,
}: EnsurePracticeDayForDateParams): Promise<PracticeDay> {
  const { data: existingDay, error: existingDayError } = await supabase
    .from("practice_days")
    .select("id, user_id, practice_date, daily_reflection, created_at, updated_at")
    .eq("user_id", userId)
    .eq("practice_date", practiceDate)
    .maybeSingle()

  if (existingDayError) {
    throw new Error(existingDayError.message)
  }

  if (existingDay) {
    return existingDay as PracticeDay
  }

  const { data: createdDay, error: createdDayError } = await supabase
    .from("practice_days")
    .insert({
      user_id: userId,
      practice_date: practiceDate,
    })
    .select("id, user_id, practice_date, daily_reflection, created_at, updated_at")
    .single()

  if (createdDayError) {
    if (createdDayError.code === "23505") {
      const { data: racedDay, error: racedDayError } = await supabase
        .from("practice_days")
        .select(
          "id, user_id, practice_date, daily_reflection, created_at, updated_at"
        )
        .eq("user_id", userId)
        .eq("practice_date", practiceDate)
        .single()

      if (racedDayError) {
        throw new Error(racedDayError.message)
      }

      return racedDay as PracticeDay
    }

    throw new Error(createdDayError.message)
  }

  return createdDay as PracticeDay
}

export async function ensureTodayPracticeDay(
  supabase: SupabaseServerClient,
  userId: string
): Promise<PracticeDay> {
  return ensurePracticeDayForDate({
    supabase,
    userId,
    practiceDate: getToday(),
  })
}

export async function recordPracticeNote({
  supabase,
  userId,
  practiceDayId,
  body,
  practiceEventId = null,
  pieceId = null,
  reviewEventId = null,
  categoryId = null,
}: RecordPracticeNoteParams) {
  const trimmedBody = body.trim()

  if (trimmedBody === "") {
    return null
  }

  const { data, error } = await supabase
    .from("practice_notes")
    .insert({
      user_id: userId,
      practice_day_id: practiceDayId,
      practice_event_id: practiceEventId,
      piece_id: pieceId,
      review_event_id: reviewEventId,
      category_id: categoryId,
      body: trimmedBody,
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function recordFormalReviewPracticeEvent({
  supabase,
  userId,
  pieceId,
  reviewEventId,
}: RecordFormalReviewPracticeEventParams): Promise<PracticeEvent | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("practice_diary_enabled")
    .eq("id", userId)
    .maybeSingle()

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (!profile?.practice_diary_enabled) {
    return null
  }

  const practiceDay = await ensureTodayPracticeDay(supabase, userId)

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("practice_events")
    .select(
      `
        id,
        user_id,
        practice_day_id,
        piece_id,
        review_event_id,
        event_type,
        source_type,
        source_id,
        counted_as_review,
        created_at
      `
    )
    .eq("user_id", userId)
    .eq("review_event_id", reviewEventId)
    .maybeSingle()

  if (existingEventError) {
    throw new Error(existingEventError.message)
  }

  if (existingEvent) {
    return existingEvent as PracticeEvent
  }

  const { data: practiceEvent, error: practiceEventError } = await supabase
    .from("practice_events")
    .insert({
      user_id: userId,
      practice_day_id: practiceDay.id,
      piece_id: pieceId,
      review_event_id: reviewEventId,
      event_type: "formal_review",
      source_type: "review",
      counted_as_review: true,
    })
    .select(
      `
        id,
        user_id,
        practice_day_id,
        piece_id,
        review_event_id,
        event_type,
        source_type,
        source_id,
        counted_as_review,
        created_at
      `
    )
    .single()

  if (practiceEventError) {
    throw new Error(practiceEventError.message)
  }

  return practiceEvent as PracticeEvent
}
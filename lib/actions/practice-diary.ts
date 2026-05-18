"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  ensurePracticeDayForDate,
  ensureTodayPracticeDay,
} from "@/lib/services/practice-diary"
import { getToday } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"

type TunePracticeCheckOutcome = "rough" | "shaky" | "solid"

function asNullablePositiveNumber(value: FormDataEntryValue | null) {
  const numberValue = Number(value)

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null
  }

  return numberValue
}

function getRedirectTo(formData: FormData, fallback = "/review/diary") {
  const redirectTo = String(formData.get("redirect_to") ?? "").trim()

  if (!redirectTo.startsWith("/")) {
    return fallback
  }

  if (redirectTo.startsWith("//")) {
    return fallback
  }

  return redirectTo
}

function normalisePracticeDate(value: FormDataEntryValue | null) {
  const date = String(value ?? "").trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  return getToday()
}

function appendStatus(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

function getTunePracticeCheckOutcome(
  value: FormDataEntryValue | null
): TunePracticeCheckOutcome | null {
  const outcome = String(value ?? "").trim()

  if (outcome === "rough" || outcome === "shaky" || outcome === "solid") {
    return outcome
  }

  return null
}

async function getPracticeDiaryEnabled(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("practice_diary_enabled")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return Boolean(profile?.practice_diary_enabled)
}

export async function saveDailyReflection(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const practiceDate = normalisePracticeDate(formData.get("practice_date"))
  const body = String(formData.get("daily_reflection") ?? "").trim()
  const redirectTo = getRedirectTo(formData)

  const practiceDay = await ensurePracticeDayForDate({
    supabase,
    userId: user.id,
    practiceDate,
  })

  const { error } = await supabase
    .from("practice_days")
    .update({
      daily_reflection: body === "" ? null : body,
    })
    .eq("id", practiceDay.id)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/diary")
  redirect(appendStatus(redirectTo, "diary", "reflection_saved"))
}

export async function createPracticeNote(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const practiceDate = normalisePracticeDate(formData.get("practice_date"))
  const redirectTo = getRedirectTo(formData)
  const body = String(formData.get("body") ?? "").trim()

  if (body === "") {
    redirect(appendStatus(redirectTo, "diary", "empty_note"))
  }

  const practiceDay = await ensurePracticeDayForDate({
    supabase,
    userId: user.id,
    practiceDate,
  })

  const practiceEventId = asNullablePositiveNumber(
    formData.get("practice_event_id")
  )
  const pieceId = asNullablePositiveNumber(formData.get("piece_id"))
  const reviewEventId = asNullablePositiveNumber(formData.get("review_event_id"))
  const categoryId = asNullablePositiveNumber(formData.get("category_id"))

  const { error } = await supabase.from("practice_notes").insert({
    user_id: user.id,
    practice_day_id: practiceDay.id,
    practice_event_id: practiceEventId,
    piece_id: pieceId,
    review_event_id: reviewEventId,
    category_id: categoryId,
    body,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/diary")

  if (pieceId) {
    revalidatePath(`/library/${pieceId}`)
  }

  redirect(appendStatus(redirectTo, "diary", "note_saved"))
}

export async function updatePracticeNote(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const noteId = asNullablePositiveNumber(formData.get("note_id"))
  const categoryId = asNullablePositiveNumber(formData.get("category_id"))
  const redirectTo = getRedirectTo(formData)
  const body = String(formData.get("body") ?? "").trim()

  if (!noteId) {
    redirect(appendStatus(redirectTo, "diary", "missing_note"))
  }

  if (body === "") {
    redirect(appendStatus(redirectTo, "diary", "empty_note"))
  }

  if (categoryId) {
    const { data: category, error: categoryError } = await supabase
      .from("practice_note_categories")
      .select("id")
      .eq("id", categoryId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (categoryError) {
      throw new Error(categoryError.message)
    }

    if (!category) {
      redirect(appendStatus(redirectTo, "diary", "invalid_category"))
    }
  }

  const { data: updatedNote, error } = await supabase
    .from("practice_notes")
    .update({
      body,
      category_id: categoryId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select("id, piece_id, focus_id")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!updatedNote) {
    redirect(appendStatus(redirectTo, "diary", "missing_note"))
  }

  revalidatePath("/review")
  revalidatePath("/review/diary")

  if (updatedNote.piece_id) {
    revalidatePath(`/library/${updatedNote.piece_id}`)
  }

  if (updatedNote.focus_id) {
    revalidatePath(`/review/foci/${updatedNote.focus_id}`)
  }

  redirect(appendStatus(redirectTo, "diary", "note_updated"))
}

export async function logTunePracticeCheck(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const redirectTo = getRedirectTo(formData, "/library")
  const pieceId = asNullablePositiveNumber(formData.get("piece_id"))
  const categoryId = asNullablePositiveNumber(formData.get("category_id"))
  const outcome = getTunePracticeCheckOutcome(formData.get("practice_outcome"))
  const noteBody = String(formData.get("practice_note") ?? "").trim()

  if (!pieceId) {
    redirect(appendStatus(redirectTo, "diary", "missing_piece"))
  }

  if (!outcome) {
    redirect(appendStatus(redirectTo, "diary", "invalid_outcome"))
  }

  const practiceDiaryEnabled = await getPracticeDiaryEnabled(supabase, user.id)

  if (!practiceDiaryEnabled) {
    redirect(appendStatus(redirectTo, "diary", "diary_disabled"))
  }

  const { data: piece, error: pieceError } = await supabase
    .from("pieces")
    .select("id")
    .eq("id", pieceId)
    .maybeSingle()

  if (pieceError) {
    throw new Error(pieceError.message)
  }

  if (!piece) {
    redirect(appendStatus(redirectTo, "diary", "missing_piece"))
  }

  const practiceDay = await ensureTodayPracticeDay(supabase, user.id)

  const { data: practiceEvent, error: practiceEventError } = await supabase
    .from("practice_events")
    .insert({
      user_id: user.id,
      practice_day_id: practiceDay.id,
      piece_id: pieceId,
      review_event_id: null,
      event_type: "free_practice",
      source_type: "manual",
      source_id: null,
      counted_as_review: false,
      practice_outcome: outcome,
    })
    .select("id")
    .single()

  if (practiceEventError) {
    throw new Error(practiceEventError.message)
  }

  if (noteBody !== "") {
    const { error: noteError } = await supabase.from("practice_notes").insert({
      user_id: user.id,
      practice_day_id: practiceDay.id,
      practice_event_id: practiceEvent.id,
      piece_id: pieceId,
      review_event_id: null,
      category_id: categoryId,
      body: noteBody,
    })

    if (noteError) {
      throw new Error(noteError.message)
    }
  }

  revalidatePath("/review/diary")
  revalidatePath(`/library/${pieceId}`)

  redirect(appendStatus(redirectTo, "diary", "practice_check_saved"))
}

export async function deletePracticeNote(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const noteId = asNullablePositiveNumber(formData.get("note_id"))
  const pieceId = asNullablePositiveNumber(formData.get("piece_id"))
  const redirectTo = getRedirectTo(formData)

  if (!noteId) {
    redirect(appendStatus(redirectTo, "diary", "missing_note"))
  }

  const { error } = await supabase
    .from("practice_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review/diary")

  if (pieceId) {
    revalidatePath(`/library/${pieceId}`)
  }

  redirect(appendStatus(redirectTo, "diary", "note_deleted"))
}

export async function createPracticeNoteCategory(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const name = String(formData.get("name") ?? "").trim()
  const prompt = String(formData.get("prompt") ?? "").trim()
  const redirectTo = getRedirectTo(formData)

  if (name === "") {
    redirect(appendStatus(redirectTo, "diary", "empty_category"))
  }

  const { count, error: countError } = await supabase
    .from("practice_note_categories")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  if (countError) {
    throw new Error(countError.message)
  }

  const { error } = await supabase.from("practice_note_categories").insert({
    user_id: user.id,
    name,
    prompt: prompt === "" ? null : prompt,
    applies_to_tune_notes: true,
    applies_to_daily_reflection: false,
    sort_order: ((count ?? 0) + 1) * 10,
    is_active: true,
  })

  if (error) {
    if (error.code === "23505") {
      redirect(appendStatus(redirectTo, "diary", "duplicate_category"))
    }

    throw new Error(error.message)
  }

  revalidatePath("/review")
  revalidatePath("/review/diary")
  redirect(appendStatus(redirectTo, "diary", "category_created"))
}

export async function archivePracticeNoteCategory(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const categoryId = asNullablePositiveNumber(formData.get("category_id"))
  const redirectTo = getRedirectTo(formData)

  if (!categoryId) {
    redirect(appendStatus(redirectTo, "diary", "missing_category"))
  }

  const { error } = await supabase
    .from("practice_note_categories")
    .update({ is_active: false })
    .eq("id", categoryId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review")
  revalidatePath("/review/diary")
  redirect(appendStatus(redirectTo, "diary", "category_archived"))
}

export async function ensureStarterPracticeCategories() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  await ensureTodayPracticeDay(supabase, user.id)

  const starterCategories = [
    {
      name: "Tempo",
      prompt: "What tempo felt clean, rushed, or unstable?",
      sort_order: 10,
    },
    {
      name: "Form",
      prompt: "Was the structure, part order, repeat pattern, or ending clear?",
      sort_order: 20,
    },
    {
      name: "Variations",
      prompt: "What variation ideas, ornaments, or alternate versions came up?",
      sort_order: 30,
    },
    {
      name: "Harmony",
      prompt:
        "What chords, backup ideas, double stops, or harmony parts need work?",
      sort_order: 40,
    },
    {
      name: "Technique",
      prompt: "What physical or technical issue showed up?",
      sort_order: 50,
    },
  ]

  const { error } = await supabase
    .from("practice_note_categories")
    .upsert(
      starterCategories.map((category) => ({
        user_id: user.id,
        ...category,
        applies_to_tune_notes: true,
        applies_to_daily_reflection: true,
        is_active: true,
      })),
      {
        onConflict: "user_id,name",
        ignoreDuplicates: true,
      }
    )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/review")
  revalidatePath("/review/diary")
  redirect("/review/diary?diary=starter_categories_created")
}
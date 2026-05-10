"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { ensurePracticeDayForDate, ensureTodayPracticeDay } from "@/lib/services/practice-diary"
import { getToday } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"

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
      name: "Memory",
      prompt: "What did you forget or recall more easily today?",
      sort_order: 10,
    },
    {
      name: "Tempo",
      prompt: "What tempo felt clean?",
      sort_order: 20,
    },
    {
      name: "Feel",
      prompt: "Did the tune feel natural or forced?",
      sort_order: 30,
    },
    {
      name: "Next step",
      prompt: "What should you try next time?",
      sort_order: 40,
    },
  ]

  const { error } = await supabase
    .from("practice_note_categories")
    .upsert(
      starterCategories.map((category) => ({
        user_id: user.id,
        ...category,
        applies_to_tune_notes: true,
        applies_to_daily_reflection: category.name === "Feel" || category.name === "Next step",
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
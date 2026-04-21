import { addDaysToDateOnly, getToday, isDueOnOrBefore } from "@/lib/review"
import { createClient } from "@/lib/supabase/server"
import type { StreakSummary, UserDailyStreak } from "@/lib/types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type DailyRowForCalculation = Pick<
  UserDailyStreak,
  "local_date" | "revision_done" | "practice_done"
>

function createEmptyStreakSummary(): StreakSummary {
  return {
    current_revision_streak: 0,
    longest_revision_streak: 0,
    current_practice_streak: 0,
    longest_practice_streak: 0,
    last_reconciled_date: null,
  }
}

function getDateRange(startDate: string, endDate: string) {
  const dates: string[] = []
  let current = startDate

  while (current <= endDate) {
    dates.push(current)
    current = addDaysToDateOnly(current, 1)
  }

  return dates
}

function calculateStreakSummary(
  rows: DailyRowForCalculation[],
  today: string
): StreakSummary {
  if (rows.length === 0) {
    return createEmptyStreakSummary()
  }

  const sortedRows = [...rows].sort((a, b) =>
    a.local_date.localeCompare(b.local_date)
  )

  const rowByDate = new Map(
    sortedRows.map((row) => [
      row.local_date,
      {
        revision_done: row.revision_done,
        practice_done: row.practice_done,
      },
    ])
  )

  const firstDate = sortedRows[0].local_date
  const dateRange = getDateRange(firstDate, today)

  let currentRevision = 0
  let longestRevision = 0
  let currentPractice = 0
  let longestPractice = 0

  for (const date of dateRange) {
    const row = rowByDate.get(date)

    if (row?.revision_done) {
      currentRevision += 1
      longestRevision = Math.max(longestRevision, currentRevision)
    } else {
      currentRevision = 0
    }

    if (row?.practice_done) {
      currentPractice += 1
      longestPractice = Math.max(longestPractice, currentPractice)
    } else {
      currentPractice = 0
    }
  }

  return {
    current_revision_streak: currentRevision,
    longest_revision_streak: longestRevision,
    current_practice_streak: currentPractice,
    longest_practice_streak: longestPractice,
    last_reconciled_date: today,
  }
}

async function getTodayDueCount(
  supabase: SupabaseServerClient,
  userId: string,
  today: string
) {
  const { data, error } = await supabase
    .from("user_pieces")
    .select("next_review_due")
    .eq("user_id", userId)
    .eq("status", "learning")
    .not("next_review_due", "is", null)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).filter((row) =>
    isDueOnOrBefore(row.next_review_due, today)
  ).length
}

async function upsertTodayDailyRow(
  supabase: SupabaseServerClient,
  userId: string,
  today: string,
  dueCount: number,
  markPracticeActivity: boolean
) {
  const { data: existingRow, error: existingRowError } = await supabase
    .from("user_daily_streaks")
    .select("practice_done")
    .eq("user_id", userId)
    .eq("local_date", today)
    .maybeSingle()

  if (existingRowError) {
    throw new Error(existingRowError.message)
  }

  const practiceDone = Boolean(existingRow?.practice_done) || markPracticeActivity
  const revisionDone = dueCount === 0

  const { error: upsertError } = await supabase
    .from("user_daily_streaks")
    .upsert(
      {
        user_id: userId,
        local_date: today,
        due_count: dueCount,
        revision_done: revisionDone,
        practice_done: practiceDone,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,local_date",
      }
    )

  if (upsertError) {
    throw new Error(upsertError.message)
  }
}

async function fetchDailyRows(
  supabase: SupabaseServerClient,
  userId: string
): Promise<DailyRowForCalculation[]> {
  const { data, error } = await supabase
    .from("user_daily_streaks")
    .select("local_date, revision_done, practice_done")
    .eq("user_id", userId)
    .order("local_date", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as DailyRowForCalculation[]
}

async function persistStreakSummary(
  supabase: SupabaseServerClient,
  userId: string,
  summary: StreakSummary
) {
  const { error } = await supabase.from("user_streak_stats").upsert(
    {
      user_id: userId,
      current_revision_streak: summary.current_revision_streak,
      longest_revision_streak: summary.longest_revision_streak,
      current_practice_streak: summary.current_practice_streak,
      longest_practice_streak: summary.longest_practice_streak,
      last_reconciled_date: summary.last_reconciled_date,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) {
    throw new Error(error.message)
  }
}

export async function reconcileStreaksForUser(
  supabase: SupabaseServerClient,
  userId: string,
  options?: {
    markPracticeActivity?: boolean
  }
): Promise<StreakSummary> {
  const today = getToday()
  const markPracticeActivity = options?.markPracticeActivity ?? false

  const dueCount = await getTodayDueCount(supabase, userId, today)

  await upsertTodayDailyRow(
    supabase,
    userId,
    today,
    dueCount,
    markPracticeActivity
  )

  const dailyRows = await fetchDailyRows(supabase, userId)
  const summary = calculateStreakSummary(dailyRows, today)

  await persistStreakSummary(supabase, userId, summary)

  return summary
}

export async function getStreakSummaryForUser(
  supabase: SupabaseServerClient,
  userId: string
): Promise<StreakSummary> {
  const { data, error } = await supabase
    .from("user_streak_stats")
    .select(
      "current_revision_streak, longest_revision_streak, current_practice_streak, longest_practice_streak, last_reconciled_date"
    )
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return createEmptyStreakSummary()
  }

  return {
    current_revision_streak: data.current_revision_streak ?? 0,
    longest_revision_streak: data.longest_revision_streak ?? 0,
    current_practice_streak: data.current_practice_streak ?? 0,
    longest_practice_streak: data.longest_practice_streak ?? 0,
    last_reconciled_date: data.last_reconciled_date ?? null,
  }
}
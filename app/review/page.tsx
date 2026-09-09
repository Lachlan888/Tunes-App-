import { redirect } from "next/navigation"
import ActivePracticeSection from "@/components/practice/ActivePracticeSection"
import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import ReviewQueueSection from "@/components/practice/ReviewQueueSection"
import FocusedPracticeSession from "@/components/practice/FocusedPracticeSession"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PageHeader from "@/components/ui/PageHeader"
import { loadReviewPageData } from "@/lib/loaders/review"
import { parsePracticeLane } from "@/lib/practice-session"

type ReviewPageProps = {
  searchParams?: Promise<{
    mode?: string
    remove_from_practice?: string
    practice_update?: string
    preferred_reference?: string | string[]
    loop?: string | string[]
    session?: string
    list_id?: string
    focus_id?: string
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolvedSearchParams = await searchParams
  const showSection = (sectionId: string) => {
    void sectionId
    return true
  }

  const mode = resolvedSearchParams?.mode ?? ""
  const reviewMode = mode === "catch-up" ? "catch-up" : "due-today"
  const practiceLane = parsePracticeLane(resolvedSearchParams?.session)
  const removeFromPracticeStatus =
    resolvedSearchParams?.remove_from_practice ?? ""
  const practiceUpdate = resolvedSearchParams?.practice_update ?? ""
  const loopStatus = getSingleValue(resolvedSearchParams?.loop)
  const preferredReferenceStatus = getSingleValue(
    resolvedSearchParams?.preferred_reference
  )

  const {
    practiceDiaryEnabled,
    noteCategories,
    streakSummary,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
    today,
  } = await loadReviewPageData()

  const dueTodayRedirectTo = "/review#review-queue"
  const catchUpRedirectTo = "/review?mode=catch-up#review-queue"
  const redirectTo =
    reviewMode === "catch-up" ? catchUpRedirectTo : dueTodayRedirectTo

  if (!streakSummary) {
    redirect("/login")
  }

  if (practiceLane) {
    let queue = practiceLane === "catch-up" ? catchUpQueue : dueTodayPieces
    let sessionLabel: string | undefined
    let sessionKey: string | undefined

    if (practiceLane === "list") {
      const listId = Number(resolvedSearchParams?.list_id)
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()
      const { data: list } = await supabase
        .from("learning_lists")
        .select("id, name")
        .eq("id", listId)
        .maybeSingle()
      const { data: memberships } = list
        ? await supabase
            .from("learning_list_items")
            .select("piece_id")
            .eq("learning_list_id", list.id)
        : { data: [] }
      const pieceIds = new Set((memberships ?? []).map((item) => item.piece_id))

      queue = list ? practiceItems.filter((item) => pieceIds.has(item.piece_id)) : []
      sessionLabel = list ? list.name : "List unavailable"
      sessionKey = list ? `list-${list.id}` : "list-unavailable"
    }

    if (practiceLane === "focus") {
      const focusId = Number(resolvedSearchParams?.focus_id)
      const { createClient } = await import("@/lib/supabase/server")
      const supabase = await createClient()
      const { data: authData } = await supabase.auth.getUser()
      const { data: focus } = await supabase
        .from("practice_foci")
        .select("id, title")
        .eq("id", focusId)
        .eq("user_id", authData.user?.id ?? "")
        .eq("status", "active")
        .maybeSingle()
      const { data: memberships } = focus
        ? await supabase
            .from("practice_focus_tunes")
            .select("piece_id")
            .eq("focus_id", focus.id)
        : { data: [] }
      const pieceIds = new Set((memberships ?? []).map((item) => item.piece_id))

      queue = focus ? practiceItems.filter((item) => pieceIds.has(item.piece_id)) : []
      sessionLabel = focus ? focus.title : "Focus unavailable"
      sessionKey = focus ? `focus-${focus.id}` : "focus-unavailable"
    }

    return (
      <FocusedPracticeSession
        lane={practiceLane}
        initialQueue={queue}
        sessionDate={today}
        noteCategories={practiceDiaryEnabled ? noteCategories : []}
        sessionLabel={sessionLabel}
        sessionKey={sessionKey}
      />
    )
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <PageHeader title="Practice" />

      {showSection("status_messages") ? (
        <PracticeStatusMessages
          practiceUpdate={practiceUpdate}
          removeFromPracticeStatus={removeFromPracticeStatus}
          loopStatus={loopStatus}
          preferredReferenceStatus={preferredReferenceStatus}
        />
      ) : null}

      {(showSection("due_today") || showSection("catch_up")) ? (
        <ReviewQueueSection
          dueTodayPieces={showSection("due_today") ? dueTodayPieces : []}
          catchUpQueue={showSection("catch_up") ? catchUpQueue : []}
        />
      ) : null}

      {showSection("active_practice") ? (
        <ActivePracticeSection
          practiceItems={practiceItems}
          redirectTo={redirectTo}
        />
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
        {showSection("practice_nav") ? (
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Supporting tools
            </p>
            <PracticeDiaryNav active="review" />
          </section>
        ) : null}

        {showSection("streaks") ? (
          <StreakSummarySection
            streakSummary={streakSummary}
            className="lg:mt-0"
          />
        ) : null}
      </section>
    </main>
  )
}

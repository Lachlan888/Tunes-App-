import { redirectToLogin } from "@/lib/auth/login-redirect"
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
  const practiceLane = parsePracticeLane(resolvedSearchParams?.session)
  const reviewMode = resolvedSearchParams?.mode === "catch-up" ? "catch-up" : "due-today"

  const {
    practiceDiaryEnabled,
    noteCategories,
    streakSummary,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
    today, dueTodayCount, catchUpCount, activeCount, queueTotal, sessionLabel, sessionKey,
  } = await loadReviewPageData({ lane: practiceLane, listId: Number(resolvedSearchParams?.list_id), focusId: Number(resolvedSearchParams?.focus_id) })

  if (!streakSummary) {
    return redirectToLogin()
  }

  if (practiceLane) {
    const queue = practiceLane === "catch-up" ? catchUpQueue : practiceLane === "due-today" ? dueTodayPieces : practiceItems

    return (
      <FocusedPracticeSession
        key={`${today}:${practiceLane}:${sessionKey ?? ""}`}
        lane={practiceLane}
        initialQueue={queue}
        queueTotal={queueTotal}
        sessionDate={today}
        noteCategories={practiceDiaryEnabled ? noteCategories : []}
        sessionLabel={sessionLabel}
        sessionKey={sessionKey}
        catchUpCount={catchUpCount}
        practiceDiaryEnabled={practiceDiaryEnabled}
      />
    )
  }

  const redirectTo = reviewMode === "catch-up"
    ? "/review?mode=catch-up#review-queue"
    : "/review#review-queue"

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <PageHeader title="Practice" />
      <PracticeStatusMessages
        practiceUpdate={resolvedSearchParams?.practice_update ?? ""}
        removeFromPracticeStatus={resolvedSearchParams?.remove_from_practice ?? ""}
        loopStatus={getSingleValue(resolvedSearchParams?.loop)}
        preferredReferenceStatus={getSingleValue(resolvedSearchParams?.preferred_reference)}
      />
      <ReviewQueueSection dueTodayCount={dueTodayCount} catchUpCount={catchUpCount} />
      <ActivePracticeSection
        practiceItems={practiceItems}
        totalCount={activeCount}
        redirectTo={redirectTo}
      />
      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
        <PracticeDiaryNav active="review" compact />
        <StreakSummarySection streakSummary={streakSummary} className="lg:mt-0" />
      </section>
    </main>
  )
}

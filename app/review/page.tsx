import { redirect } from "next/navigation"
import ActivePracticeSection from "@/components/practice/ActivePracticeSection"
import PracticeMetronome from "@/components/practice/PracticeMetronome"
import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import ReviewQueueSection from "@/components/practice/ReviewQueueSection"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PageHeader from "@/components/ui/PageHeader"
import { loadReviewPageData } from "@/lib/loaders/review"

type ReviewPageProps = {
  searchParams?: Promise<{
    mode?: string
    remove_from_practice?: string
    practice_update?: string
    preferred_reference?: string | string[]
    loop?: string | string[]
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
  } = await loadReviewPageData()

  const dueTodayRedirectTo = "/review#review-queue"
  const catchUpRedirectTo = "/review?mode=catch-up#review-queue"
  const redirectTo =
    reviewMode === "catch-up" ? catchUpRedirectTo : dueTodayRedirectTo

  if (!streakSummary) {
    redirect("/login")
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

      <PracticeMetronome />

      {(showSection("due_today") || showSection("catch_up")) ? (
        <ReviewQueueSection
          dueTodayPieces={showSection("due_today") ? dueTodayPieces : []}
          catchUpQueue={showSection("catch_up") ? catchUpQueue : []}
          activeMode={reviewMode}
          dueTodayRedirectTo={dueTodayRedirectTo}
          catchUpRedirectTo={catchUpRedirectTo}
          practiceDiaryEnabled={practiceDiaryEnabled}
          noteCategories={noteCategories}
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

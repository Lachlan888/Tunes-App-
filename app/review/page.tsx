import { redirect } from "next/navigation"
import ActivePracticeSection from "@/components/practice/ActivePracticeSection"
import CatchUpSection from "@/components/practice/CatchUpSection"
import DueTodaySection from "@/components/practice/DueTodaySection"
import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import { loadReviewPageData } from "@/lib/loaders/review"

type ReviewPageProps = {
  searchParams?: Promise<{
    mode?: string
    remove_from_practice?: string
    practice_update?: string
  }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolvedSearchParams = await searchParams
  const mode = resolvedSearchParams?.mode ?? ""
  const removeFromPracticeStatus =
    resolvedSearchParams?.remove_from_practice ?? ""
  const practiceUpdate = resolvedSearchParams?.practice_update ?? ""

  const {
    practiceDiaryEnabled,
    noteCategories,
    streakSummary,
    practiceItems,
    dueTodayPieces,
    catchUpQueue,
    backlogSummary,
  } = await loadReviewPageData()

  const redirectTo = "/review"
  const shouldOpenCatchUp = mode === "catch-up"

  if (!streakSummary) {
    redirect("/login")
  }

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Practice
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold">
            Review your tunes
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review tunes and rate recall.
          </p>

          <PracticeDiaryNav active="review" />
        </section>

        <StreakSummarySection streakSummary={streakSummary} />
      </section>

      <PracticeStatusMessages
        practiceUpdate={practiceUpdate}
        removeFromPracticeStatus={removeFromPracticeStatus}
      />

      <CatchUpSection
        catchUpQueue={catchUpQueue}
        backlogSummary={backlogSummary}
        redirectTo={redirectTo}
        defaultOpen={shouldOpenCatchUp}
        practiceDiaryEnabled={practiceDiaryEnabled}
        noteCategories={noteCategories}
      />

      <DueTodaySection
        dueTodayPieces={dueTodayPieces}
        redirectTo={redirectTo}
        practiceDiaryEnabled={practiceDiaryEnabled}
        noteCategories={noteCategories}
      />

      <ActivePracticeSection
        practiceItems={practiceItems}
        redirectTo={redirectTo}
      />
    </main>
  )
}
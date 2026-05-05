import { redirect } from "next/navigation"
import ActivePracticeSection from "@/components/practice/ActivePracticeSection"
import CatchUpSection from "@/components/practice/CatchUpSection"
import DueTodaySection from "@/components/practice/DueTodaySection"
import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
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
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-[#20271c]">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-3xl border border-[#b0bc8c] bg-[#e4ead8] p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#596650]">
            Practice
          </p>

          <h1 className="mt-2 font-serif text-4xl font-bold">
            Review your tunes
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#596650]">
            Review tunes and rate recall.
          </p>
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
      />

      <DueTodaySection
        dueTodayPieces={dueTodayPieces}
        redirectTo={redirectTo}
      />

      <ActivePracticeSection
        practiceItems={practiceItems}
        redirectTo={redirectTo}
      />
    </main>
  )
}
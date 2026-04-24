import { redirect } from "next/navigation"
import ActivePracticeSection from "@/components/practice/ActivePracticeSection"
import CatchUpSection from "@/components/practice/CatchUpSection"
import DueTodaySection from "@/components/practice/DueTodaySection"
import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import StreakSummarySection from "@/components/StreakSummarySection"
import { loadReviewPageData } from "@/lib/loaders/review"

type ReviewPageProps = {
  searchParams?: Promise<{
    remove_from_practice?: string
    practice_update?: string
  }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolvedSearchParams = await searchParams
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

  if (!streakSummary) {
    redirect("/login")
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Practice</h1>

      <div className="mt-8">
        <StreakSummarySection streakSummary={streakSummary} />
      </div>

      <PracticeStatusMessages
        practiceUpdate={practiceUpdate}
        removeFromPracticeStatus={removeFromPracticeStatus}
      />

      <CatchUpSection
        catchUpQueue={catchUpQueue}
        backlogSummary={backlogSummary}
        redirectTo={redirectTo}
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
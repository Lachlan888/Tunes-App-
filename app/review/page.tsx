import { redirect } from "next/navigation"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import ActivePracticeSection from "@/components/practice/ActivePracticeSection"
import CatchUpSection from "@/components/practice/CatchUpSection"
import DueTodaySection from "@/components/practice/DueTodaySection"
import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { loadReviewPageData } from "@/lib/loaders/review"
import { PRACTICE_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"

type ReviewPageProps = {
  searchParams?: Promise<{
    mode?: string
    remove_from_practice?: string
    practice_update?: string
    page_options?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getPageOptionsMessage(status: string) {
  if (status === "saved") return "Practice page options saved."
  if (status === "reset") return "Practice page options reset."
  if (status === "error") return "Could not save Practice page options."

  return null
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolvedSearchParams = await searchParams
  const pagePreferences = await loadPagePreferences(
    PRACTICE_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const mode = resolvedSearchParams?.mode ?? ""
  const removeFromPracticeStatus =
    resolvedSearchParams?.remove_from_practice ?? ""
  const practiceUpdate = resolvedSearchParams?.practice_update ?? ""
  const pageOptionsMessage = getPageOptionsMessage(
    getSingleValue(resolvedSearchParams?.page_options)
  )

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
      {pageOptionsMessage ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {pageOptionsMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Practice
              </p>

              <h1 className="mt-2 font-serif text-4xl font-bold">
                Review your tunes
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Review tunes and rate recall.
              </p>
            </div>

            <PageOptionsModal
              config={PRACTICE_PAGE_OPTIONS_CONFIG}
              preferences={pagePreferences}
              redirectTo="/review"
            />
          </div>

          {showSection("practice_nav") ? (
            <PracticeDiaryNav active="review" />
          ) : null}
        </section>

        {showSection("streaks") ? (
          <StreakSummarySection streakSummary={streakSummary} />
        ) : null}
      </section>

      {showSection("status_messages") ? (
        <PracticeStatusMessages
          practiceUpdate={practiceUpdate}
          removeFromPracticeStatus={removeFromPracticeStatus}
        />
      ) : null}

      {showSection("catch_up") ? (
        <CatchUpSection
          catchUpQueue={catchUpQueue}
          backlogSummary={backlogSummary}
          redirectTo={redirectTo}
          defaultOpen={shouldOpenCatchUp}
          practiceDiaryEnabled={practiceDiaryEnabled}
          noteCategories={noteCategories}
        />
      ) : null}

      {showSection("due_today") ? (
        <DueTodaySection
          dueTodayPieces={dueTodayPieces}
          redirectTo={redirectTo}
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
    </main>
  )
}
import { redirect } from "next/navigation"
import Link from "next/link"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import ActivePracticeSection from "@/components/practice/ActivePracticeSection"
import CatchUpSection from "@/components/practice/CatchUpSection"
import DueTodaySection from "@/components/practice/DueTodaySection"
import PracticeStatusMessages from "@/components/practice/PracticeStatusMessages"
import StreakSummarySection from "@/components/practice/StreakSummarySection"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import { joinClasses } from "@/components/ui/buttonStyles"
import { upsertPreferredReferenceUrl } from "@/lib/actions/user-piece-metadata"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { loadReviewPageData } from "@/lib/loaders/review"
import { PRACTICE_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"

type ReviewPageProps = {
  searchParams?: Promise<{
    mode?: string
    remove_from_practice?: string
    practice_update?: string
    preferred_reference?: string | string[]
    page_options?: string | string[]
    loop?: string | string[]
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

function MobileReviewModeLink({
  href,
  label,
  count,
  isActive,
}: {
  href: string
  label: string
  count: number
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={joinClasses(
        "rounded-2xl border p-4 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background/70 text-foreground hover:bg-muted"
      )}
    >
      <p
        className={joinClasses(
          "text-xs font-semibold uppercase tracking-[0.14em]",
          isActive ? "text-primary-foreground/85" : "text-muted-foreground"
        )}
      >
        {label}
      </p>

      <p className="mt-2 font-serif text-3xl font-bold leading-none">
        {count}
      </p>
    </Link>
  )
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const resolvedSearchParams = await searchParams
  const pagePreferences = await loadPagePreferences(
    PRACTICE_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const mode = resolvedSearchParams?.mode ?? ""
  const mobileReviewMode = mode === "catch-up" ? "catch-up" : "due-today"
  const removeFromPracticeStatus =
    resolvedSearchParams?.remove_from_practice ?? ""
  const practiceUpdate = resolvedSearchParams?.practice_update ?? ""
  const loopStatus = getSingleValue(resolvedSearchParams?.loop)
  const preferredReferenceStatus = getSingleValue(
    resolvedSearchParams?.preferred_reference
  )
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
  } = await loadReviewPageData()

  const redirectTo = "/review"
  const shouldOpenCatchUp = mode === "catch-up"

  if (!streakSummary) {
    redirect("/login")
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      {pageOptionsMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {pageOptionsMessage}
        </div>
      ) : null}

      <section className="mb-5 md:hidden">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Practice
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <MobileReviewModeLink
              href="/review#due-today"
              label="Due today"
              count={dueTodayPieces.length}
              isActive={mobileReviewMode === "due-today"}
            />

            <MobileReviewModeLink
              href="/review?mode=catch-up#catch-up"
              label="Catch-up"
              count={catchUpQueue.length}
              isActive={mobileReviewMode === "catch-up"}
            />
          </div>

          {showSection("practice_nav") ? (
            <div className="mt-4">
              <PracticeDiaryNav active="review" />
            </div>
          ) : null}
        </div>
      </section>

      <section className="hidden gap-6 md:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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
          loopStatus={loopStatus}
          preferredReferenceStatus={preferredReferenceStatus}
        />
      ) : null}

      {showSection("due_today") ? (
        <div
          className={
            mobileReviewMode === "catch-up" ? "hidden md:block" : undefined
          }
        >
          <DueTodaySection
            dueTodayPieces={dueTodayPieces}
            redirectTo={redirectTo}
            practiceDiaryEnabled={practiceDiaryEnabled}
            noteCategories={noteCategories}
            upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
          />
        </div>
      ) : null}

      {showSection("catch_up") ? (
        <div
          className={
            mobileReviewMode === "due-today" ? "hidden md:block" : undefined
          }
        >
          <CatchUpSection
            catchUpQueue={catchUpQueue}
            redirectTo={redirectTo}
            defaultOpen={shouldOpenCatchUp}
            practiceDiaryEnabled={practiceDiaryEnabled}
            noteCategories={noteCategories}
            upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
          />
        </div>
      ) : null}

      <div className="mt-6 md:hidden">
        {showSection("streaks") ? (
          <StreakSummarySection streakSummary={streakSummary} />
        ) : null}
      </div>

      {showSection("active_practice") ? (
        <ActivePracticeSection
          practiceItems={practiceItems}
          redirectTo={redirectTo}
        />
      ) : null}
    </main>
  )
}

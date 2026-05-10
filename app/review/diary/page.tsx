import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PracticeDayView from "@/components/practice-diary/PracticeDayView"
import {
  loadPracticeDiaryDayData,
  requirePracticeDiaryEnabled,
} from "@/lib/loaders/practice-diary"

type PracticeDiaryPageProps = {
  searchParams?: Promise<{
    date?: string
  }>
}

export default async function PracticeDiaryPage({
  searchParams,
}: PracticeDiaryPageProps) {
  await requirePracticeDiaryEnabled()

  const resolvedSearchParams = await searchParams
  const diaryData = await loadPracticeDiaryDayData(resolvedSearchParams?.date)

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Practice diary
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          A date-bound record of what you reviewed and practised. This first
          slice logs formal review activity automatically.
        </p>

        <PracticeDiaryNav active="diary" />
      </section>

      <PracticeDayView data={diaryData} />
    </main>
  )
}
import PracticeDiaryIndex from "@/components/practice-diary/PracticeDiaryIndex"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import {
  loadPracticeIndexData,
  type PracticeIndexSearchParams,
} from "@/lib/loaders/practice-index"
import { requirePracticeDiaryEnabled } from "@/lib/loaders/practice-diary"

type PracticeDiaryIndexPageProps = {
  searchParams?: Promise<PracticeIndexSearchParams>
}

export default async function PracticeDiaryIndexPage({
  searchParams,
}: PracticeDiaryIndexPageProps) {
  await requirePracticeDiaryEnabled()

  const resolvedSearchParams = await searchParams
  const indexData = await loadPracticeIndexData(resolvedSearchParams)

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm md:mb-6 md:rounded-3xl md:p-6">
        <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground md:block">
          Practice
        </p>

        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight md:mt-2 md:text-5xl">
          Practice index
        </h1>

        <p className="mt-3 hidden max-w-3xl text-base leading-7 text-muted-foreground md:block">
          Combine practice notes by category so musical patterns are easier to
          find across different days and tunes.
        </p>

        <PracticeDiaryNav active="index" />
      </section>

      <PracticeDiaryIndex data={indexData} />
    </main>
  )
}
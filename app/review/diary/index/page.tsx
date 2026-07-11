import PracticeDiaryIndex from "@/components/practice-diary/PracticeDiaryIndex"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PageHeader from "@/components/ui/PageHeader"
import { loadPracticeIndexData } from "@/lib/loaders/practice-index"
import { requirePracticeDiaryEnabled } from "@/lib/loaders/practice-diary"

export default async function PracticeDiaryIndexPage() {
  await requirePracticeDiaryEnabled()

  const indexData = await loadPracticeIndexData()

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <PageHeader title="Practice Index" />

      <section className="mb-5 md:mb-6">
        <PracticeDiaryNav active="index" />
      </section>

      <PracticeDiaryIndex data={indexData} />
    </main>
  )
}

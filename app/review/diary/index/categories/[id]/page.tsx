import Link from "next/link"
import PracticeCategoryDetail from "@/components/practice-diary/PracticeCategoryDetail"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { requirePracticeDiaryEnabled } from "@/lib/loaders/practice-diary"
import { loadPracticeCategoryDetailData } from "@/lib/loaders/practice-index"

type PracticeCategoryDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function PracticeCategoryDetailPage({
  params,
}: PracticeCategoryDetailPageProps) {
  await requirePracticeDiaryEnabled()

  const resolvedParams = await params
  const categoryId = Number(resolvedParams.id)
  const data = await loadPracticeCategoryDetailData(categoryId)

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="mb-5 md:hidden">
        <Link href="/review/diary/index" className={buttonStyles.text}>
          Back to index
        </Link>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice category
        </p>

        <h1 className="mt-2 break-words font-serif text-3xl font-bold leading-tight tracking-tight">
          {data.category.name}
        </h1>

        {data.category.prompt ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {data.category.prompt}
          </p>
        ) : null}

        <PracticeDiaryNav active="index" />
      </section>

      <section className="mb-6 hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
        <Link href="/review/diary/index" className={buttonStyles.text}>
          Back to index
        </Link>

        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice category
        </p>

        <h1 className="mt-2 break-words font-serif text-5xl font-bold leading-tight tracking-tight">
          {data.category.name}
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          {data.category.prompt ??
            "A focused view of notes and tunes linked to this practice category."}
        </p>

        <PracticeDiaryNav active="index" />
      </section>

      <PracticeCategoryDetail data={data} />
    </main>
  )
}
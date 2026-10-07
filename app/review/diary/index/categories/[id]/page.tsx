import Link from "next/link"
import PracticeCategoryDetail from "../../../../../../components/practice-diary/PracticeCategoryDetail"
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

        <h1 className="mt-4 break-words font-sans text-4xl font-bold leading-tight tracking-tight">
          {data.category.name}
        </h1>
        <p className="mt-2 text-xs font-medium text-muted-foreground">Practice category</p>

        {data.category.prompt ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {data.category.prompt}
          </p>
        ) : null}

        <PracticeDiaryNav active="index" />
      </section>

      <section className="mb-6 hidden pb-6 md:block">
        <Link href="/review/diary/index" className={buttonStyles.text}>
          Back to index
        </Link>

        <h1 className="mt-4 break-words font-sans text-5xl font-bold leading-tight tracking-tight">
          {data.category.name}
        </h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">Practice category</p>

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

import Link from "next/link"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PracticeFocusDetail from "../../../../components/practice-foci/PracticeFocusDetail"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { loadPracticeFocusDetailPageData } from "@/lib/loaders/practice-foci"

type PracticeFocusDetailPageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    foci?: string
  }>
}

function getFociStatusMessage(status: string | undefined) {
  if (status === "updated") return "Practice focus updated."
  if (status === "archived") return "Practice focus archived."
  if (status === "tune_added") return "Tune added to focus."
  if (status === "tune_removed") return "Tune removed from focus."
  if (status === "missing_title") return "Add a title before saving this focus."
  if (status === "missing_focus") return "Couldn’t find that focus."
  if (status === "missing_piece") return "Choose a tune first."
  if (status === "missing_focus_tune") {
    return "Couldn’t find that tune link."
  }
  if (status === "focus_not_found") return "That focus could not be found."
  if (status === "focus_not_active") {
    return "Only active focus areas can be changed."
  }
  if (status === "not_in_repertoire") {
    return "Only tunes in your known repertoire or active practice can be added to a focus."
  }

  return null
}

export default async function PracticeFocusDetailPage({
  params,
  searchParams,
}: PracticeFocusDetailPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const focusId = Number(resolvedParams.id)

  const { focus, allFoci, focusTuneOptions, recentNotes } =
    await loadPracticeFocusDetailPageData(focusId)

  const statusMessage = getFociStatusMessage(resolvedSearchParams?.foci)
  const redirectTo = `/review/foci/${focus.id}`

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="mb-5 md:hidden">
        <Link href="/review/foci" className={buttonStyles.text}>
          Back to focus areas
        </Link>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice focus
        </p>

        <h1 className="mt-2 break-words font-serif text-3xl font-bold leading-tight tracking-tight">
          {focus.title}
        </h1>

        {focus.description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {focus.description}
          </p>
        ) : null}

        <PracticeDiaryNav active="foci" />
      </section>

      <section className="mb-6 hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Link href="/review/foci" className={buttonStyles.text}>
              Back to focus areas
            </Link>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Practice focus
            </p>

            <h1 className="mt-2 break-words font-serif text-5xl font-bold leading-tight tracking-tight">
              {focus.title}
            </h1>

            <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
              {focus.description ??
                "Use this focus to group related known and active-practice tunes."}
            </p>
          </div>
        </div>

        <PracticeDiaryNav active="foci" />
      </section>

      {statusMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {statusMessage}
        </div>
      ) : null}

      <PracticeFocusDetail
        focus={focus}
        allFoci={allFoci}
        focusTuneOptions={focusTuneOptions}
        recentNotes={recentNotes}
        redirectTo={redirectTo}
      />
    </main>
  )
}

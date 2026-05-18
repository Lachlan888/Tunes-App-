import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PracticeFocusCreateForm from "@/components/practice-foci/PracticeFocusCreateForm"
import PracticeFocusList from "@/components/practice-foci/PracticeFocusList"
import { loadPracticeFociPageData } from "@/lib/loaders/practice-foci"

type PracticeFociPageProps = {
  searchParams?: Promise<{
    foci?: string
  }>
}

function getFociStatusMessage(status: string | undefined) {
  if (status === "created") return "Practice focus created."
  if (status === "updated") return "Practice focus updated."
  if (status === "deleted") return "Practice focus deleted."
  if (status === "archived") return "Practice focus archived."
  if (status === "tune_added") return "Tune added to focus."
  if (status === "tune_removed") return "Tune removed from focus."
  if (status === "missing_title") return "Add a title before creating a focus."
  if (status === "missing_focus") return "Could not find that focus."
  if (status === "missing_piece") return "Choose a tune first."
  if (status === "missing_focus_tune") {
    return "Could not find that tune link."
  }
  if (status === "focus_not_found") return "That focus could not be found."
  if (status === "focus_not_active") {
    return "Only active foci can be changed."
  }
  if (status === "not_in_practice") {
    return "Only active-practice tunes can be added to a focus."
  }

  return null
}

export default async function PracticeFociPage({
  searchParams,
}: PracticeFociPageProps) {
  const resolvedSearchParams = await searchParams
  const statusMessage = getFociStatusMessage(resolvedSearchParams?.foci)

  const { activeFoci, pausedFoci, completedFoci, archivedFoci } =
    await loadPracticeFociPageData()

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="mb-5 md:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold leading-tight tracking-tight">
          Practice foci
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Broader musical projects for the tunes you are actively practising.
        </p>

        <PracticeDiaryNav active="foci" />
      </section>

      <section className="mb-6 hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice
        </p>

        <h1 className="mt-2 font-serif text-5xl font-bold leading-tight tracking-tight">
          Practice foci
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          Group active-practice tunes around broader musical projects, without
          changing Stage, due dates, streaks, or diary history.
        </p>

        <PracticeDiaryNav active="foci" />
      </section>

      {statusMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {statusMessage}
        </div>
      ) : null}

      <section className="grid gap-7 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)] xl:gap-6">
        <div className="min-w-0 xl:order-2">
          <PracticeFocusList
            activeFoci={activeFoci}
            pausedFoci={pausedFoci}
            completedFoci={completedFoci}
            archivedFoci={archivedFoci}
          />
        </div>

        <div className="min-w-0 xl:order-1">
          <PracticeFocusCreateForm />
        </div>
      </section>
    </main>
  )
}
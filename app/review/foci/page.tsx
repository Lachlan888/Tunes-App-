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

  const {
    activeFoci,
    pausedFoci,
    completedFoci,
    archivedFoci,
    activePracticeTunes,
  } = await loadPracticeFociPageData()

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Practice foci
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Group active-practice tunes around a broader area of work, without
          changing review stage, due date, streaks, or diary history.
        </p>

        <PracticeDiaryNav active="foci" />
      </section>

      {statusMessage ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <PracticeFocusCreateForm />

        <PracticeFocusList
          activeFoci={activeFoci}
          pausedFoci={pausedFoci}
          completedFoci={completedFoci}
          archivedFoci={archivedFoci}
          activePracticeTunes={activePracticeTunes}
        />
      </section>
    </main>
  )
}
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import PracticeFocusCreateForm from "@/components/practice-foci/PracticeFocusCreateForm"
import PracticeFocusList from "@/components/practice-foci/PracticeFocusList"
import PageHeader from "@/components/ui/PageHeader"
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
  if (status === "missing_focus") return "Couldn’t find that focus."
  if (status === "missing_piece") return "Choose a tune first."
  if (status === "missing_focus_tune") {
    return "Couldn’t find that tune link."
  }
  if (status === "focus_not_found") return "That focus could not be found."
  if (status === "focus_not_active") {
    return "Only active focus areas can be changed."
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
      <PageHeader title="Foci" />

      <section className="mb-6">
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

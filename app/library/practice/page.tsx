import RepertoireTuneList from "@/components/repertoire/RepertoireTuneList"
import { addToLearningList } from "@/lib/actions/lists"
import { loadPracticeTunesPageData } from "@/lib/loaders/repertoire"

type PracticeTunesPageProps = {
  searchParams?: Promise<{
    list_add?: string
    remove_from_practice?: string
  }>
}

function StatusMessage({
  status,
  type,
}: {
  status: string
  type: "list_add" | "remove_from_practice"
}) {
  if (type === "list_add" && status === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-success bg-success/10 p-4 text-sm font-medium text-muted-foreground">
        Tune added to list.
      </div>
    )
  }

  if (type === "list_add" && status === "duplicate") {
    return (
      <div className="mb-6 rounded-2xl border border-border bg-muted p-4 text-sm font-medium text-muted-foreground">
        That tune is already in this list.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-success bg-success/10 p-4 text-sm font-medium text-muted-foreground">
        Tune removed from practice.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "missing_user_piece") {
    return (
      <div className="mb-6 rounded-2xl border border-warning bg-warning/20 p-4 text-sm font-medium text-warning-foreground">
        Could not tell which practice tune to remove.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "not_found") {
    return (
      <div className="mb-6 rounded-2xl border border-warning bg-warning/20 p-4 text-sm font-medium text-warning-foreground">
        That practice tune could not be found.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "error") {
    return (
      <div className="mb-6 rounded-2xl border border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive">
        Could not remove tune from practice.
      </div>
    )
  }

  return null
}

export default async function PracticeTunesPage({
  searchParams,
}: PracticeTunesPageProps) {
  const resolvedSearchParams = await searchParams
  const listAddStatus = resolvedSearchParams?.list_add ?? ""
  const removeFromPracticeStatus =
    resolvedSearchParams?.remove_from_practice ?? ""

  const { practiceItems, learningLists, learningListItems } =
    await loadPracticeTunesPageData()

  const redirectTo = "/library/practice"

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice library
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground">
          In practice
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Tunes currently in your active review system.
        </p>

        <div className="mt-6 max-w-sm rounded-2xl border border-border border-l-8 border-l-primary bg-background/70 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            In practice
          </p>
          <p className="mt-2 font-serif text-5xl font-bold text-foreground">
            {practiceItems.length}
          </p>
        </div>
      </section>

      <StatusMessage status={listAddStatus} type="list_add" />
      <StatusMessage
        status={removeFromPracticeStatus}
        type="remove_from_practice"
      />

      <RepertoireTuneList
        mode="practice"
        practiceItems={practiceItems}
        learningLists={learningLists}
        learningListItems={learningListItems}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
      />
    </main>
  )
}
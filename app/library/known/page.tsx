import RepertoireTuneList from "@/components/repertoire/RepertoireTuneList"
import { addToLearningList } from "@/lib/actions/lists"
import { loadKnownTunesPageData } from "@/lib/loaders/repertoire"

type KnownTunesPageProps = {
  searchParams?: Promise<{
    list_add?: string
    remove_tune?: string
  }>
}

function StatusMessage({
  status,
  type,
}: {
  status: string
  type: "list_add" | "remove_tune"
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

  if (type === "remove_tune" && status === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-success bg-success/10 p-4 text-sm font-medium text-muted-foreground">
        Tune removed from your app.
      </div>
    )
  }

  if (type === "remove_tune" && status === "missing_piece") {
    return (
      <div className="mb-6 rounded-2xl border border-warning bg-warning/20 p-4 text-sm font-medium text-warning-foreground">
        Couldn’t tell which tune to remove.
      </div>
    )
  }

  if (type === "remove_tune" && status === "error") {
    return (
      <div className="mb-6 rounded-2xl border border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive">
        Couldn’t remove tune.
      </div>
    )
  }

  return null
}

export default async function KnownTunesPage({
  searchParams,
}: KnownTunesPageProps) {
  const resolvedSearchParams = await searchParams
  const listAddStatus = resolvedSearchParams?.list_add ?? ""
  const removeTuneStatus = resolvedSearchParams?.remove_tune ?? ""

  const { pieces, learningLists, learningListItems } =
    await loadKnownTunesPageData()

  const redirectTo = "/library/known"

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Known library
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground">
          Known tunes
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Tunes you have marked as already known.
        </p>

        <div className="mt-6 max-w-sm rounded-2xl border border-border border-l-8 border-l-success bg-background/70 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Known tunes
          </p>
          <p className="mt-2 font-serif text-5xl font-bold text-foreground">
            {pieces.length}
          </p>
        </div>
      </section>

      <StatusMessage status={listAddStatus} type="list_add" />
      <StatusMessage status={removeTuneStatus} type="remove_tune" />

      <RepertoireTuneList
        mode="known"
        knownItems={pieces.map((piece) => ({ piece }))}
        learningLists={learningLists}
        learningListItems={learningListItems}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
      />
    </main>
  )
}

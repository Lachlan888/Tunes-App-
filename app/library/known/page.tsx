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
      <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
        Tune added to list.
      </div>
    )
  }

  if (type === "list_add" && status === "duplicate") {
    return (
      <div className="mb-6 rounded border border-gray-400 bg-gray-50 p-3 text-sm text-gray-800">
        That tune is already in this list.
      </div>
    )
  }

  if (type === "remove_tune" && status === "success") {
    return (
      <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
        Tune removed from your app.
      </div>
    )
  }

  if (type === "remove_tune" && status === "missing_piece") {
    return (
      <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
        Could not tell which tune to remove.
      </div>
    )
  }

  if (type === "remove_tune" && status === "error") {
    return (
      <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
        Could not remove tune.
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
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Known tunes</h1>
      <p className="mb-6 text-gray-600">
        Tunes you have marked as already known.
      </p>

      <StatusMessage status={listAddStatus} type="list_add" />
      <StatusMessage status={removeTuneStatus} type="remove_tune" />

      <div className="mb-4 rounded border p-4">
        <p className="text-sm text-gray-600">Known tunes</p>
        <p className="mt-1 text-3xl font-bold">{pieces.length}</p>
      </div>

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
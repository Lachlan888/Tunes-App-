import RepertoireTuneList from "@/components/RepertoireTuneList"
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

  if (type === "remove_from_practice" && status === "success") {
    return (
      <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
        Tune removed from practice.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "missing_user_piece") {
    return (
      <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
        Could not tell which practice tune to remove.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "not_found") {
    return (
      <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
        That practice tune could not be found.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "error") {
    return (
      <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
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
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">In practice</h1>
      <p className="mb-6 text-gray-600">
        Tunes currently in your active review system.
      </p>

      <StatusMessage status={listAddStatus} type="list_add" />
      <StatusMessage
        status={removeFromPracticeStatus}
        type="remove_from_practice"
      />

      <div className="mb-4 rounded border p-4">
        <p className="text-sm text-gray-600">In practice</p>
        <p className="mt-1 text-3xl font-bold">{practiceItems.length}</p>
      </div>

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
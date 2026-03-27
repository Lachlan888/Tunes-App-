import Link from "next/link"
import CreateTuneModal from "@/components/CreateTuneModal"
import LibraryList from "@/components/LibraryList"
import { addToLearningList } from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLibraryData } from "@/lib/loaders/library"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
  reference_url: string | null
}

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

type LearningList = {
  id: number
  name: string
  description: string | null
}

type LearningListItem = {
  piece_id: number
  learning_list_id: number
  learning_lists: {
    id: number
    name: string
    user_id: string
  }
}

type LibraryPageProps = {
  searchParams?: Promise<{
    key?: string
    style?: string
    time_signature?: string
    list_add?: string
    create_tune?: string
  }>
}

export default async function LibraryPage({
  searchParams,
}: LibraryPageProps) {
  const { user, pieces, userPieces, learningLists, learningListItems } =
    await loadLibraryData()

  const resolvedSearchParams = await searchParams
  const selectedKey = resolvedSearchParams?.key ?? ""
  const selectedStyle = resolvedSearchParams?.style ?? ""
  const selectedTimeSignature = resolvedSearchParams?.time_signature ?? ""
  const listAddStatus = resolvedSearchParams?.list_add ?? ""
  const createTuneStatus = resolvedSearchParams?.create_tune ?? ""

  const redirectParams = new URLSearchParams()

  if (selectedKey) {
    redirectParams.set("key", selectedKey)
  }

  if (selectedStyle) {
    redirectParams.set("style", selectedStyle)
  }

  if (selectedTimeSignature) {
    redirectParams.set("time_signature", selectedTimeSignature)
  }

  const redirectTo = redirectParams.toString()
    ? `/library?${redirectParams.toString()}`
    : "/library"

  const availableKeys = Array.from(
    new Set(
      (pieces ?? [])
        .map((piece) => piece.key)
        .filter((key): key is string => Boolean(key))
    )
  ).sort()

  const availableStyles = Array.from(
    new Set(
      (pieces ?? [])
        .map((piece) => piece.style)
        .filter((style): style is string => Boolean(style))
    )
  ).sort()

  const availableTimeSignatures = Array.from(
    new Set(
      (pieces ?? [])
        .map((piece) => piece.time_signature)
        .filter(
          (timeSignature): timeSignature is string => Boolean(timeSignature)
        )
    )
  ).sort()

  const filteredPieces = (pieces ?? []).filter((piece: Piece) => {
    const matchesKey = selectedKey === "" || piece.key === selectedKey
    const matchesStyle = selectedStyle === "" || piece.style === selectedStyle
    const matchesTimeSignature =
      selectedTimeSignature === "" ||
      piece.time_signature === selectedTimeSignature

    return matchesKey && matchesStyle && matchesTimeSignature
  })

  const hasActiveFilters =
    selectedKey !== "" ||
    selectedStyle !== "" ||
    selectedTimeSignature !== ""

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Tunes</h1>
      <p className="mb-4 text-gray-600">Logged in as {user.email}</p>

      <CreateTuneModal />

      {createTuneStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune created.
        </div>
      )}

      {createTuneStatus === "missing_title" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please enter a tune title.
        </div>
      )}

      {createTuneStatus === "error" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          Could not create tune.
        </div>
      )}

      {listAddStatus === "success" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Tune added to list.
        </div>
      )}

      {listAddStatus === "duplicate" && (
        <div className="mb-6 rounded border border-gray-400 bg-gray-50 p-3 text-sm text-gray-800">
          That tune is already in this list.
        </div>
      )}

      <form method="GET" className="mb-6">
        <label htmlFor="key" className="mb-2 block text-sm font-medium">
          Filter by key
        </label>
        <select
          id="key"
          name="key"
          defaultValue={selectedKey}
          className="mb-4 w-full border p-2"
        >
          <option value="">All keys</option>
          {availableKeys.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>

        <label htmlFor="style" className="mb-2 block text-sm font-medium">
          Filter by style
        </label>
        <select
          id="style"
          name="style"
          defaultValue={selectedStyle}
          className="mb-4 w-full border p-2"
        >
          <option value="">All styles</option>
          {availableStyles.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>

        <label
          htmlFor="time_signature"
          className="mb-2 block text-sm font-medium"
        >
          Filter by time signature
        </label>
        <select
          id="time_signature"
          name="time_signature"
          defaultValue={selectedTimeSignature}
          className="mb-4 w-full border p-2"
        >
          <option value="">All time signatures</option>
          {availableTimeSignatures.map((timeSignature) => (
            <option key={timeSignature} value={timeSignature}>
              {timeSignature}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4">
          <button className="bg-black px-4 py-2 text-white">Apply Filter</button>

          {hasActiveFilters && (
            <Link href="/library" className="text-sm underline">
              Clear filters
            </Link>
          )}
        </div>
      </form>

      <LibraryList
        pieces={filteredPieces}
        userPieces={userPieces}
        learningLists={learningLists}
        learningListItems={learningListItems as LearningListItem[] | null}
        startLearning={startLearning}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
      />
    </main>
  )
}
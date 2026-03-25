import Link from "next/link"
import LibraryList from "@/components/LibraryList"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadLibraryData } from "@/lib/loaders/library"

type Piece = {
  id: number
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
}

type UserPiece = {
  id: number
  piece_id: number
  status: string
  next_review_due: string | null
  stage: number
}

type LibraryPageProps = {
  searchParams?: Promise<{
    key?: string
    style?: string
    time_signature?: string
  }>
}

export default async function LibraryPage({
  searchParams,
}: LibraryPageProps) {
  const { user, pieces, userPieces } = await loadLibraryData()
  const resolvedSearchParams = await searchParams
  const selectedKey = resolvedSearchParams?.key ?? ""
  const selectedStyle = resolvedSearchParams?.style ?? ""
  const selectedTimeSignature = resolvedSearchParams?.time_signature ?? ""

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
        .filter((timeSignature): timeSignature is string => Boolean(timeSignature))
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
      <h1 className="mb-2 text-3xl font-bold">Library</h1>
      <p className="mb-6 text-gray-600">Logged in as {user.email}</p>

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
        startLearning={startLearning}
      />
    </main>
  )
}
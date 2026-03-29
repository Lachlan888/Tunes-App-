import Link from "next/link"
import TuneCard from "@/components/TuneCard"
import { loadCompareData } from "@/lib/loaders/compare"
import type { Piece } from "@/lib/types"

type ComparePageProps = {
  searchParams?: Promise<{
    user?: string
    key?: string
    style?: string
    time_signature?: string
  }>
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const resolvedSearchParams = await searchParams

  const searchValue = resolvedSearchParams?.user ?? ""
  const selectedKey = resolvedSearchParams?.key ?? ""
  const selectedStyle = resolvedSearchParams?.style ?? ""
  const selectedTimeSignature = resolvedSearchParams?.time_signature ?? ""

  const {
    matchedProfile,
    matchingProfiles,
    mutualPieces,
    error,
  } = await loadCompareData(searchValue)

  const availableKeys = Array.from(
    new Set(
      mutualPieces
        .map((piece) => piece.key)
        .filter((key): key is string => Boolean(key))
    )
  ).sort()

  const availableStyles = Array.from(
    new Set(
      mutualPieces
        .map((piece) => piece.style)
        .filter((style): style is string => Boolean(style))
    )
  ).sort()

  const availableTimeSignatures = Array.from(
    new Set(
      mutualPieces
        .map((piece) => piece.time_signature)
        .filter(
          (timeSignature): timeSignature is string => Boolean(timeSignature)
        )
    )
  ).sort()

  const filteredPieces = mutualPieces.filter((piece: Piece) => {
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

  const clearFiltersHref = searchValue
    ? `/compare?user=${encodeURIComponent(searchValue)}`
    : "/compare"

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Compare Tunes</h1>
      <p className="mb-6 text-gray-600">
        Find tunes you have in common with another user by username or display name.
      </p>

      <form method="GET" className="mb-8 rounded border p-4">
        <label
          htmlFor="user"
          className="mb-2 block text-sm font-medium"
        >
          Username or display name
        </label>

        <div className="flex gap-3">
          <input
            id="user"
            name="user"
            defaultValue={searchValue}
            className="w-full rounded border p-2"
            placeholder="Enter username or display name"
          />
          <button className="rounded bg-black px-4 py-2 text-white">
            Compare
          </button>
        </div>
      </form>

      {error === "missing_search" && (
        <div className="mb-6 rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
          Enter a username or display name to compare.
        </div>
      )}

      {error === "user_not_found" && (
        <div className="mb-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          No user found for “{searchValue}”.
        </div>
      )}

      {error === "self_compare" && (
        <div className="mb-6 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          You cannot compare with your own profile.
        </div>
      )}

      {error === "multiple_matches" && (
        <div className="mb-6 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          <p className="font-medium">
            More than one user matched that display name.
          </p>
          <p className="mt-1">
            Try using a username instead.
          </p>

          {matchingProfiles.length > 0 && (
            <ul className="mt-3 list-disc pl-5">
              {matchingProfiles.map((profile) => (
                <li key={profile.id}>
                  {profile.display_name || "Unnamed"}{" "}
                  <span className="text-gray-600">(@{profile.username})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {matchedProfile && error === null && (
        <>
          <div className="mb-6 rounded border p-4">
            <h2 className="text-xl font-semibold">
              In common with{" "}
              {matchedProfile.display_name || matchedProfile.username}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Username: @{matchedProfile.username}
            </p>
            <p className="mt-2 text-sm text-gray-700">
              {mutualPieces.length} mutual tune
              {mutualPieces.length === 1 ? "" : "s"} found.
            </p>
          </div>

          <form method="GET" className="mb-6">
            <input type="hidden" name="user" value={searchValue} />

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
              <button className="bg-black px-4 py-2 text-white">
                Apply Filter
              </button>

              {hasActiveFilters && (
                <Link href={clearFiltersHref} className="text-sm underline">
                  Clear filters
                </Link>
              )}
            </div>
          </form>

          {filteredPieces.length === 0 ? (
            <p>No mutual tunes match this filter.</p>
          ) : (
            <div className="space-y-3">
              {filteredPieces.map((piece) => (
                <TuneCard
                  key={piece.id}
                  id={piece.id}
                  title={piece.title}
                  keyValue={piece.key}
                  style={piece.style}
                  timeSignature={piece.time_signature}
                  referenceUrl={piece.reference_url}
                  listNames={[]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
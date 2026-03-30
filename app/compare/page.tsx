import TuneCard from "@/components/TuneCard"
import PieceSearchFilters from "@/components/PieceSearchFilters"
import {
  getPieceFilterOptions,
  pieceMatchesFilters,
} from "@/lib/search-filters"
import { loadCompareData } from "@/lib/loaders/compare"
import type { Piece } from "@/lib/types"

type ComparePageProps = {
  searchParams?: Promise<{
    user?: string
    q?: string
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
  const titleQuery = resolvedSearchParams?.q ?? ""
  const selectedKey = resolvedSearchParams?.key ?? ""
  const selectedStyle = resolvedSearchParams?.style ?? ""
  const selectedTimeSignature = resolvedSearchParams?.time_signature ?? ""

  const {
    matchedProfile,
    matchingProfiles,
    mutualPieces,
    error,
  } = await loadCompareData(searchValue)

  const {
    keys: availableKeys,
    styles: availableStyles,
    timeSignatures: availableTimeSignatures,
  } = getPieceFilterOptions(mutualPieces)

  const filteredPieces = mutualPieces.filter((piece: Piece) =>
    pieceMatchesFilters(piece, {
      q: titleQuery,
      keys: selectedKey ? [selectedKey] : [],
      styles: selectedStyle ? [selectedStyle] : [],
      timeSignatures: selectedTimeSignature ? [selectedTimeSignature] : [],
    })
  )

  const hasActiveFilters =
    titleQuery !== "" ||
    selectedKey !== "" ||
    selectedStyle !== "" ||
    selectedTimeSignature !== ""

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Compare Tunes</h1>
      <p className="mb-6 text-gray-600">
        Find tunes you have in common with another user by username or display
        name.
      </p>

      <form method="GET" className="mb-8 rounded border p-4">
        <label htmlFor="user" className="mb-2 block text-sm font-medium">
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
          <p className="mt-1">Try using a username instead.</p>

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

          <PieceSearchFilters
            basePath="/compare"
            searchLabel="Search by title"
            searchPlaceholder="Search mutual tunes"
            searchValue={titleQuery}
            selectedKey={selectedKey}
            selectedStyle={selectedStyle}
            selectedTimeSignature={selectedTimeSignature}
            availableKeys={availableKeys}
            availableStyles={availableStyles}
            availableTimeSignatures={availableTimeSignatures}
            hasActiveFilters={hasActiveFilters}
            preservedParams={{ user: searchValue }}
          />

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
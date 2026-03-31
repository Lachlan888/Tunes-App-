import Link from "next/link"
import TuneCard from "@/components/TuneCard"
import PieceSearchFilters from "@/components/PieceSearchFilters"
import { sendFriendRequest } from "@/lib/actions/friends"
import {
  getPieceFilterOptions,
  pieceMatchesFilters,
} from "@/lib/search-filters"
import { loadCompareData } from "@/lib/loaders/compare"
import type { Piece } from "@/lib/types"

type ComparePageProps = {
  searchParams?: Promise<{
    user?: string | string[]
    q?: string | string[]
    key?: string | string[]
    style?: string | string[]
    time_signature?: string | string[]
    friend_request?: string
  }>
}

function toArray(value: string | string[] | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value.filter(Boolean) : [value]
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const resolvedSearchParams = await searchParams

  const searchValue = Array.isArray(resolvedSearchParams?.user)
    ? resolvedSearchParams?.user[0] ?? ""
    : resolvedSearchParams?.user ?? ""

  const titleQuery = Array.isArray(resolvedSearchParams?.q)
    ? resolvedSearchParams?.q[0] ?? ""
    : resolvedSearchParams?.q ?? ""

  const friendRequestStatus = resolvedSearchParams?.friend_request ?? ""

  const selectedKeys = toArray(resolvedSearchParams?.key)
  const selectedStyles = toArray(resolvedSearchParams?.style)
  const selectedTimeSignatures = toArray(resolvedSearchParams?.time_signature)

  const {
    matchedProfile,
    matchingProfiles,
    searchMatches,
    mutualPieces,
    compareSuggestions,
    isAcceptedFriend,
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
      keys: selectedKeys,
      styles: selectedStyles,
      timeSignatures: selectedTimeSignatures,
    })
  )

  const hasActiveFilters =
    titleQuery !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0

  const redirectTo = searchValue
    ? `/compare?user=${encodeURIComponent(searchValue)}`
    : "/compare"

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Compare Tunes</h1>
      <p className="mb-6 text-gray-600">
        Search for another user, then compare the tunes you have in common.
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
            placeholder="Search by username or display name"
          />
          <button className="rounded bg-black px-4 py-2 text-white">
            Search
          </button>
        </div>
      </form>

      {friendRequestStatus === "sent" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Friend request sent.
        </div>
      )}

      {friendRequestStatus === "missing_user" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please choose a valid user.
        </div>
      )}

      {friendRequestStatus === "self" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          You cannot send a friend request to yourself.
        </div>
      )}

      {friendRequestStatus === "not_found" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          That user could not be found.
        </div>
      )}

      {friendRequestStatus === "duplicate" && (
        <div className="mb-6 rounded border border-gray-400 bg-gray-50 p-3 text-sm text-gray-800">
          A pending or accepted connection already exists with that user.
        </div>
      )}

      {compareSuggestions.length > 0 && (
        <section className="mb-8 rounded border p-4">
          <h2 className="text-xl font-semibold">Compare with a friend</h2>
          <p className="mt-1 text-sm text-gray-600">
            Quick suggestions from your accepted friends.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {compareSuggestions.map((friend) => (
              <div
                key={friend.user_id}
                className="rounded border border-gray-200 p-4"
              >
                <p className="font-medium">
                  {friend.display_name || friend.username}
                </p>
                <p className="mt-1 text-sm text-gray-600">@{friend.username}</p>

                <div className="mt-3">
                  <Link
                    href={`/compare?user=${encodeURIComponent(friend.username)}`}
                    className="inline-block rounded bg-black px-4 py-2 text-sm text-white"
                  >
                    Compare
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
        <section className="mb-8 rounded border p-4">
          <h2 className="text-xl font-semibold">Choose a user</h2>
          <p className="mt-1 text-sm text-gray-600">
            More than one user matched “{searchValue}”.
          </p>

          <div className="mt-4 space-y-3">
            {matchingProfiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p className="font-medium">
                    {profile.display_name || profile.username || "Unnamed user"}
                  </p>
                  {profile.username && (
                    <p className="text-sm text-gray-600">@{profile.username}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {profile.username ? (
                    <Link
                      href={`/compare?user=${encodeURIComponent(profile.username)}`}
                      className="rounded bg-black px-3 py-2 text-sm text-white"
                    >
                      Compare
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-500">
                      No username available
                    </span>
                  )}

                  <form action={sendFriendRequest}>
                    <input
                      type="hidden"
                      name="addressee_id"
                      value={profile.id}
                    />
                    <input
                      type="hidden"
                      name="redirect_to"
                      value={redirectTo}
                    />
                    <button className="rounded border px-3 py-2 text-sm">
                      Send request
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {error === null &&
        !matchedProfile &&
        searchMatches.length > 0 &&
        !isAcceptedFriend && (
          <section className="mb-8 rounded border p-4">
            <h2 className="text-xl font-semibold">Choose a user</h2>
            <p className="mt-1 text-sm text-gray-600">
              Select the person you want to compare with.
            </p>

            <div className="mt-4 space-y-3">
              {searchMatches.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between rounded border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {profile.display_name || profile.username || "Unnamed user"}
                    </p>
                    {profile.username && (
                      <p className="text-sm text-gray-600">@{profile.username}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {profile.username ? (
                      <Link
                        href={`/compare?user=${encodeURIComponent(profile.username)}`}
                        className="rounded bg-black px-3 py-2 text-sm text-white"
                      >
                        Compare
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No username available
                      </span>
                    )}

                    <form action={sendFriendRequest}>
                      <input
                        type="hidden"
                        name="addressee_id"
                        value={profile.id}
                      />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <button className="rounded border px-3 py-2 text-sm">
                        Send request
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {matchedProfile && error === null && !isAcceptedFriend && (
        <section className="mb-8 rounded border p-4">
          <h2 className="text-xl font-semibold">User found</h2>

          <div className="mt-4 flex items-center justify-between rounded border p-4">
            <div>
              <p className="font-medium">
                {matchedProfile.display_name || matchedProfile.username}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                @{matchedProfile.username}
              </p>
            </div>

            <form action={sendFriendRequest}>
              <input
                type="hidden"
                name="addressee_id"
                value={matchedProfile.id}
              />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <button className="rounded border px-3 py-2 text-sm">
                Send request
              </button>
            </form>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            You need to be friends before using compare with this user.
          </p>
        </section>
      )}

      {matchedProfile && error === null && isAcceptedFriend && (
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
            selectedKeys={selectedKeys}
            selectedStyles={selectedStyles}
            selectedTimeSignatures={selectedTimeSignatures}
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
                  pieceStyles={piece.piece_styles}
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
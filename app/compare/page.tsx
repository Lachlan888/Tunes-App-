import CompareSearchForm from "@/components/CompareSearchForm"
import PendingLinkButton from "@/components/PendingLinkButton"
import SubmitButton from "@/components/SubmitButton"
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

function buildCompareHref(
  users: string[],
  extraParams?: {
    q?: string
    key?: string[]
    style?: string[]
    time_signature?: string[]
  }
) {
  const params = new URLSearchParams()

  users.forEach((user) => {
    params.append("user", user)
  })

  if (extraParams?.q) {
    params.set("q", extraParams.q)
  }

  extraParams?.key?.forEach((value) => {
    params.append("key", value)
  })

  extraParams?.style?.forEach((value) => {
    params.append("style", value)
  })

  extraParams?.time_signature?.forEach((value) => {
    params.append("time_signature", value)
  })

  const query = params.toString()
  return query ? `/compare?${query}` : "/compare"
}

function removeUserOnce(users: string[], userToRemove: string) {
  let removed = false

  return users.filter((user) => {
    if (!removed && user.toLowerCase() === userToRemove.toLowerCase()) {
      removed = true
      return false
    }

    return true
  })
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const resolvedSearchParams = await searchParams

  const selectedUsers = toArray(resolvedSearchParams?.user)
  const primarySearchValue = selectedUsers[selectedUsers.length - 1] ?? ""

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
    canCompare,
    error,
    selectedProfiles,
  } = await loadCompareData(selectedUsers)

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

  const redirectTo = buildCompareHref(selectedUsers)

  const unresolvedUsers =
    error === "multiple_matches" || error === "user_not_found" || error === "self_compare"
      ? [primarySearchValue]
      : []

  const stableSelectedUsernames = [
    ...selectedProfiles
      .map((profile) => profile.username)
      .filter((username): username is string => Boolean(username)),
    ...unresolvedUsers.filter(Boolean),
  ]

  const compareSummaryNames = selectedProfiles.map(
    (profile) => profile.display_name || profile.username
  )

  const compareHeading =
    compareSummaryNames.length === 0
      ? "Common tunes"
      : compareSummaryNames.length === 1
        ? `In common with ${compareSummaryNames[0]}`
        : `Common to your group (${compareSummaryNames.length + 1} players including you)`

  const filterPreservedUsers =
    stableSelectedUsernames.length > 0 ? stableSelectedUsernames : selectedUsers

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Compare Tunes</h1>
      <p className="mb-6 text-gray-600">
        Build a group, then see the tunes common to everyone in it.
      </p>

      <CompareSearchForm initialQuery="" selectedUsers={filterPreservedUsers} />

      {filterPreservedUsers.length > 0 && (
        <section className="mb-8 rounded border p-4">
          <h2 className="text-xl font-semibold">Current group</h2>
          <p className="mt-1 text-sm text-gray-600">
            You are always included. Add other players to find tunes common to the whole group.
          </p>

          {selectedProfiles.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedProfiles.map((profile) => {
                const name = profile.display_name || profile.username
                const nextUsers = removeUserOnce(
                  filterPreservedUsers,
                  profile.username ?? ""
                )

                return (
                  <div
                    key={profile.id}
                    className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
                  >
                    <span>{name}</span>
                    {profile.username && (
                      <span className="text-gray-500">@{profile.username}</span>
                    )}
                    {profile.username && (
                      <PendingLinkButton
                        href={buildCompareHref(nextUsers, {
                          q: titleQuery,
                          key: selectedKeys,
                          style: selectedStyles,
                          time_signature: selectedTimeSignatures,
                        })}
                        label="Remove"
                        pendingLabel="Removing..."
                        className="rounded border px-2 py-1 text-xs"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-600">
              No confirmed users in the group yet.
            </p>
          )}
        </section>
      )}

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
          <h2 className="text-xl font-semibold">Add a friend</h2>
          <p className="mt-1 text-sm text-gray-600">
            Quick suggestions from your accepted friends.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {compareSuggestions.map((friend) => {
              const alreadySelected = filterPreservedUsers.some(
                (user) => user.toLowerCase() === friend.username.toLowerCase()
              )

              const nextUsers = alreadySelected
                ? filterPreservedUsers
                : [...filterPreservedUsers, friend.username]

              return (
                <div
                  key={friend.user_id}
                  className="rounded border border-gray-200 p-4"
                >
                  <p className="font-medium">
                    {friend.display_name || friend.username}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">@{friend.username}</p>

                  <div className="mt-3">
                    <PendingLinkButton
                      href={buildCompareHref(nextUsers)}
                      label={alreadySelected ? "Already added" : "Add to group"}
                      pendingLabel="Loading..."
                      className="rounded bg-black px-4 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {error === "missing_search" && (
        <div className="mb-6 rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
          Add at least one username or display name to start comparing.
        </div>
      )}

      {error === "user_not_found" && (
        <div className="mb-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          No user found for “{primarySearchValue}”.
        </div>
      )}

      {error === "self_compare" && (
        <div className="mb-6 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          You cannot add your own profile to the compare group.
        </div>
      )}

      {error === "multiple_matches" && (
        <section className="mb-8 rounded border p-4">
          <h2 className="text-xl font-semibold">Choose a user</h2>
          <p className="mt-1 text-sm text-gray-600">
            More than one user matched “{primarySearchValue}”.
          </p>

          <div className="mt-4 space-y-3">
            {matchingProfiles.map((profile) => {
              const nextUsers = [
                ...removeUserOnce(filterPreservedUsers, primarySearchValue),
                profile.username ?? "",
              ].filter(Boolean)

              return (
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
                      <PendingLinkButton
                        href={buildCompareHref(nextUsers)}
                        label="Add to group"
                        pendingLabel="Loading..."
                        className="rounded bg-black px-3 py-2 text-sm text-white"
                      />
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
                      <SubmitButton
                        label="Send request"
                        pendingLabel="Sending..."
                        className="rounded border px-3 py-2 text-sm"
                      />
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {error === null && !matchedProfile && searchMatches.length > 0 && (
        <section className="mb-8 rounded border p-4">
          <h2 className="text-xl font-semibold">Choose a user</h2>
          <p className="mt-1 text-sm text-gray-600">
            Select the person you want to add to this compare group.
          </p>

          <div className="mt-4 space-y-3">
            {searchMatches.map((profile) => {
              const nextUsers = [
                ...removeUserOnce(filterPreservedUsers, primarySearchValue),
                profile.username ?? "",
              ].filter(Boolean)

              return (
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
                      <PendingLinkButton
                        href={buildCompareHref(nextUsers)}
                        label="Add to group"
                        pendingLabel="Loading..."
                        className="rounded bg-black px-3 py-2 text-sm text-white"
                      />
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
                      <SubmitButton
                        label="Send request"
                        pendingLabel="Sending..."
                        className="rounded border px-3 py-2 text-sm"
                      />
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {matchedProfile && error === null && !canCompare && (
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

            {!isAcceptedFriend && (
              <form action={sendFriendRequest}>
                <input
                  type="hidden"
                  name="addressee_id"
                  value={matchedProfile.id}
                />
                <input type="hidden" name="redirect_to" value={redirectTo} />
                <SubmitButton
                  label="Send request"
                  pendingLabel="Sending..."
                  className="rounded border px-3 py-2 text-sm"
                />
              </form>
            )}
          </div>

          <p className="mt-3 text-sm text-gray-600">
            This user requires friendship before others can compare with them.
          </p>
        </section>
      )}

      {selectedProfiles.length > 0 && error === null && canCompare && (
        <>
          <div className="mb-6 rounded border p-4">
            <h2 className="text-xl font-semibold">{compareHeading}</h2>

            {selectedProfiles.length === 1 ? (
              <p className="mt-1 text-sm text-gray-600">
                Username: @{selectedProfiles[0]?.username}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-600">
                Group: you,{" "}
                {selectedProfiles
                  .map((profile) => profile.display_name || profile.username)
                  .join(", ")}
              </p>
            )}

            {selectedProfiles.length === 1 && !isAcceptedFriend && (
              <p className="mt-2 text-sm text-gray-600">
                Compare is public for this user, so you do not need to be
                friends to view overlap.
              </p>
            )}

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
            preservedParams={{ user: filterPreservedUsers }}
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
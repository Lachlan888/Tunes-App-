import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import FriendSearchForm from "@/components/FriendSearchForm"
import FriendsListSection from "@/components/FriendsListSection"
import RecentFriendActivitySection from "@/components/RecentFriendActivitySection"
import SubmitButton from "@/components/SubmitButton"
import { acceptFriendRequest, sendFriendRequest } from "@/lib/actions/friends"
import { loadFriendsPageData } from "@/lib/loaders/friends"

type FriendsPageProps = {
  searchParams?: Promise<{
    q?: string | string[]
    friend_request?: string
    friend_accept?: string
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function renderUserLink(username: string | null, displayName: string | null) {
  const label = displayName || username || "Unnamed user"

  if (!username) {
    return <span>{label}</span>
  }

  return (
    <Link href={`/users/${username}`} className="underline hover:no-underline">
      {label}
    </Link>
  )
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const resolvedSearchParams = await searchParams
  const searchQuery = getSingleValue(resolvedSearchParams?.q)
  const friendRequestStatus = getSingleValue(
    resolvedSearchParams?.friend_request
  )
  const friendAcceptStatus = getSingleValue(resolvedSearchParams?.friend_accept)

  const {
    pendingIncomingRequests,
    acceptedFriends,
    searchMatches,
    recentFriendActivity,
  } = await loadFriendsPageData(searchQuery)

  return (
    <main className="p-8">
      <h1 className="mb-2 text-3xl font-bold">Friends</h1>
      <p className="mb-6 text-gray-600">
        Search for new musicians, send friend requests, and manage your music
        connections.
      </p>

      {friendRequestStatus === "sent" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Friend request sent.
        </div>
      )}

      {friendRequestStatus === "missing_user" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Please choose a user from the search results.
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

      {friendAcceptStatus === "accepted" && (
        <div className="mb-6 rounded border border-green-600 bg-green-50 p-3 text-sm text-green-800">
          Friend request accepted.
        </div>
      )}

      {friendAcceptStatus === "missing_connection" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          Could not tell which friend request to accept.
        </div>
      )}

      {friendAcceptStatus === "not_found" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          That friend request could not be found.
        </div>
      )}

      {friendAcceptStatus === "forbidden" && (
        <div className="mb-6 rounded border border-red-600 bg-red-50 p-3 text-sm text-red-800">
          You are not allowed to accept that request.
        </div>
      )}

      {friendAcceptStatus === "invalid_status" && (
        <div className="mb-6 rounded border border-yellow-600 bg-yellow-50 p-3 text-sm text-yellow-800">
          That request is no longer pending.
        </div>
      )}

      <section className="mb-10 rounded border p-4">
        <h2 className="mb-2 text-xl font-semibold">Find new friends</h2>
        <p className="mb-4 text-sm text-gray-600">
          Search returns users you are not already connected with. Existing
          friends and pending requests appear in the sections below.
        </p>

        <FriendSearchForm initialQuery={searchQuery} />

        {!searchQuery && (
          <EmptyState
            title="Find musicians to connect with"
            description="Search by username or display name. Once connected, you can compare repertoire and see relevant activity."
            className="mt-4"
          />
        )}

        {searchQuery && searchMatches.length === 0 && (
          <EmptyState
            title="No new users found"
            description="No unconnected users matched that search. If you are already friends or already have a pending request, they will appear in your friends or requests sections instead."
            className="mt-4"
          />
        )}

        {searchMatches.length > 0 && (
          <div className="space-y-3">
            {searchMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p className="font-medium">
                    {renderUserLink(match.username, match.display_name)}
                  </p>
                  {match.username && (
                    <p className="text-sm text-gray-600">
                      <Link
                        href={`/users/${match.username}`}
                        className="underline hover:no-underline"
                      >
                        @{match.username}
                      </Link>
                    </p>
                  )}
                </div>

                <form action={sendFriendRequest}>
                  <input type="hidden" name="addressee_id" value={match.id} />
                  <input
                    type="hidden"
                    name="redirect_to"
                    value={`/friends?q=${encodeURIComponent(searchQuery)}`}
                  />
                  <SubmitButton
                    label="Send request"
                    pendingLabel="Sending..."
                    className="rounded border px-3 py-2 text-sm"
                  />
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 rounded border p-4">
        <h2 className="mb-4 text-xl font-semibold">Incoming requests</h2>

        {pendingIncomingRequests.length === 0 ? (
          <EmptyState
            title="No incoming requests"
            description="Friend requests from other users will appear here."
          />
        ) : (
          <div className="space-y-3">
            {pendingIncomingRequests.map((request) => (
              <div
                key={request.connection_id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p className="font-medium">
                    {renderUserLink(request.username, request.display_name)}
                  </p>
                  {request.username && (
                    <p className="text-sm text-gray-600">
                      <Link
                        href={`/users/${request.username}`}
                        className="underline hover:no-underline"
                      >
                        @{request.username}
                      </Link>
                    </p>
                  )}
                </div>

                <form action={acceptFriendRequest}>
                  <input
                    type="hidden"
                    name="connection_id"
                    value={request.connection_id}
                  />
                  <input type="hidden" name="redirect_to" value="/friends" />
                  <SubmitButton
                    label="Accept"
                    pendingLabel="Accepting..."
                    className="rounded border px-3 py-2 text-sm"
                  />
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <FriendsListSection friends={acceptedFriends} />

      <RecentFriendActivitySection items={recentFriendActivity} />
    </main>
  )
}
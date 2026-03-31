import FriendsListSection from "@/components/FriendsListSection"
import RecentFriendActivitySection from "@/components/RecentFriendActivitySection"
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
        Search for other users, send friend requests, and manage your music
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
        <h2 className="mb-4 text-xl font-semibold">Search users</h2>

        <form method="GET" className="mb-4 flex gap-3">
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="Search by name or username"
            className="w-full rounded border p-2"
          />
          <button className="rounded bg-black px-4 py-2 text-white">
            Search
          </button>
        </form>

        {searchQuery && searchMatches.length === 0 && (
          <p className="text-sm text-gray-600">No matching users found.</p>
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
                    {match.display_name || match.username || "Unnamed user"}
                  </p>
                  {match.username && (
                    <p className="text-sm text-gray-600">@{match.username}</p>
                  )}
                </div>

                <form action={sendFriendRequest}>
                  <input type="hidden" name="addressee_id" value={match.id} />
                  <input
                    type="hidden"
                    name="redirect_to"
                    value={`/friends?q=${encodeURIComponent(searchQuery)}`}
                  />
                  <button className="rounded border px-3 py-2 text-sm">
                    Send request
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 rounded border p-4">
        <h2 className="mb-4 text-xl font-semibold">Incoming requests</h2>

        {pendingIncomingRequests.length === 0 ? (
          <p className="text-sm text-gray-600">No incoming requests.</p>
        ) : (
          <div className="space-y-3">
            {pendingIncomingRequests.map((request) => (
              <div
                key={request.connection_id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <p className="font-medium">
                    {request.display_name || request.username || "Unnamed user"}
                  </p>
                  {request.username && (
                    <p className="text-sm text-gray-600">@{request.username}</p>
                  )}
                </div>

                <form action={acceptFriendRequest}>
                  <input
                    type="hidden"
                    name="connection_id"
                    value={request.connection_id}
                  />
                  <input type="hidden" name="redirect_to" value="/friends" />
                  <button className="rounded border px-3 py-2 text-sm">
                    Accept
                  </button>
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
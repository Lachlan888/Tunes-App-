import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import FriendSearchForm from "@/components/friends/FriendSearchForm"
import FriendsListSection from "@/components/friends/FriendsListSection"
import RecentFriendActivitySection from "@/components/friends/RecentFriendActivitySection"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { statusStyles, type StatusTone } from "@/components/ui/statusStyles"
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
    <Link
      href={`/users/${encodeURIComponent(username)}`}
      className="decoration-primary decoration-2 underline-offset-4 hover:underline"
    >
      {label}
    </Link>
  )
}

function StatusBanner({
  tone,
  children,
}: {
  tone: StatusTone
  children: React.ReactNode
}) {
  return (
    <div
      className={`mb-6 rounded-2xl border p-4 text-sm font-medium shadow-sm ${statusStyles[tone]}`}
    >
      {children}
    </div>
  )
}

function UserHandleLink({ username }: { username: string }) {
  return (
    <Link
      href={`/users/${encodeURIComponent(username)}`}
      className="text-sm text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
    >
      @{username}
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
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Friends
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight">
          Find musicians
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Search for musicians, send friend requests, compare repertoire, and
          see relevant activity from people you are connected with.
        </p>
      </section>

      {friendRequestStatus === "sent" && (
        <StatusBanner tone="success">Friend request sent.</StatusBanner>
      )}

      {friendRequestStatus === "missing_user" && (
        <StatusBanner tone="warning">
          Please choose a user from the search results.
        </StatusBanner>
      )}

      {friendRequestStatus === "self" && (
        <StatusBanner tone="warning">
          You cannot send a friend request to yourself.
        </StatusBanner>
      )}

      {friendRequestStatus === "not_found" && (
        <StatusBanner tone="error">That user could not be found.</StatusBanner>
      )}

      {friendRequestStatus === "duplicate" && (
        <StatusBanner tone="neutral">
          A pending or accepted connection already exists with that user.
        </StatusBanner>
      )}

      {friendAcceptStatus === "accepted" && (
        <StatusBanner tone="success">Friend request accepted.</StatusBanner>
      )}

      {friendAcceptStatus === "missing_connection" && (
        <StatusBanner tone="warning">
          Could not tell which friend request to accept.
        </StatusBanner>
      )}

      {friendAcceptStatus === "not_found" && (
        <StatusBanner tone="error">
          That friend request could not be found.
        </StatusBanner>
      )}

      {friendAcceptStatus === "forbidden" && (
        <StatusBanner tone="error">
          You are not allowed to accept that request.
        </StatusBanner>
      )}

      {friendAcceptStatus === "invalid_status" && (
        <StatusBanner tone="warning">
          That request is no longer pending.
        </StatusBanner>
      )}

      <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Search
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            Find new friends
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Search returns users you are not already connected with. Existing
            friends and pending requests appear in the sections below.
          </p>
        </div>

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
          <div className="mt-5 space-y-3">
            {searchMatches.map((match) => (
              <article
                key={match.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:bg-muted/70 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {renderUserLink(match.username, match.display_name)}
                  </p>
                  {match.username && (
                    <p className="mt-1">
                      <UserHandleLink username={match.username} />
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
                    className={buttonStyles.primary}
                  />
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Requests
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            Incoming requests
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Accept requests from musicians who want to connect with you.
          </p>
        </div>

        {pendingIncomingRequests.length === 0 ? (
          <EmptyState
            title="No incoming requests"
            description="Friend requests from other users will appear here."
          />
        ) : (
          <div className="space-y-3">
            {pendingIncomingRequests.map((request) => (
              <article
                key={request.connection_id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:bg-muted/70 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {renderUserLink(request.username, request.display_name)}
                  </p>
                  {request.username && (
                    <p className="mt-1">
                      <UserHandleLink username={request.username} />
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
                    className={buttonStyles.primary}
                  />
                </form>
              </article>
            ))}
          </div>
        )}
      </section>

      <FriendsListSection friends={acceptedFriends} />

      <RecentFriendActivitySection items={recentFriendActivity} />
    </main>
  )
}
import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import FriendSearchForm from "@/components/friends/FriendSearchForm"
import FriendsListSection from "@/components/friends/FriendsListSection"
import FriendsMobileSwitcher from "@/components/friends/FriendsMobileSwitcher"
import RecentFriendActivitySection from "@/components/friends/RecentFriendActivitySection"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { statusStyles, type StatusTone } from "@/components/ui/statusStyles"
import {
  acceptFriendRequest,
  declineFriendRequest,
  sendFriendRequest,
} from "@/lib/actions/friends"
import { loadFriendsPageData } from "@/lib/loaders/friends"

type FriendsPageProps = {
  searchParams?: Promise<{
    q?: string | string[]
    friend_request?: string
    friend_accept?: string
    friend_decline?: string
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function renderUserLink(username: string | null, displayName: string | null) {
  const label = displayName || username || "Unnamed player"

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
      className={`mb-5 rounded-2xl border p-4 text-sm font-medium shadow-sm md:mb-6 ${statusStyles[tone]}`}
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

function SearchResultsSection({
  searchQuery,
  searchMatches,
}: {
  searchQuery: string
  searchMatches: {
    id: string
    username: string | null
    display_name: string | null
  }[]
}) {
  return (
    <section className="mb-7 md:mb-8 md:rounded-2xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="mb-4 md:mb-5">
        <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground md:block">
          Search
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:mt-2 md:font-serif md:text-3xl md:font-bold">
          Find friends
        </h2>
        <p className="mt-2 hidden max-w-3xl text-sm leading-6 text-muted-foreground md:block">
          Search shows people you’re not already connected with. Friends and
          pending requests appear below.
        </p>
      </div>

      <FriendSearchForm initialQuery={searchQuery} />

      {!searchQuery && (
        <EmptyState
          title="Find musicians to connect with"
          description="Search by username or display name. Once connected, you can compare repertoire and see activity."
          className="mt-4 hidden md:block"
        />
      )}

      {searchQuery && searchMatches.length === 0 && (
        <EmptyState
          title="No new people found"
          description="No unconnected people matched that search. Friends and pending requests appear below."
          className="mt-4"
        />
      )}

      {searchMatches.length > 0 && (
        <div className="mt-5 divide-y divide-border/70 md:space-y-3 md:divide-y-0">
          {searchMatches.map((match) => (
            <article
              key={match.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 md:shadow-sm md:transition md:hover:bg-muted/70"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {renderUserLink(match.username, match.display_name)}
                </p>
                {match.username && (
                  <p className="mt-1 truncate">
                    <UserHandleLink username={match.username} />
                  </p>
                )}
              </div>

              <form action={sendFriendRequest} className="shrink-0">
                <input type="hidden" name="addressee_id" value={match.id} />
                <input
                  type="hidden"
                  name="redirect_to"
                  value={`/friends?q=${encodeURIComponent(searchQuery)}`}
                />
                <SubmitButton
                  label="Send"
                  pendingLabel="Sending..."
                  className={joinClasses(
                    buttonStyles.primary,
                    "min-h-9 px-3 py-1.5 text-xs sm:px-4 sm:text-sm"
                  )}
                />
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function IncomingRequestsSection({
  pendingIncomingRequests,
}: {
  pendingIncomingRequests: {
    connection_id: number
    username: string | null
    display_name: string | null
  }[]
}) {
  return (
    <section className="mb-7 md:mb-8 md:rounded-2xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="mb-4 md:mb-5">
        <p className="hidden text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground md:block">
          Requests
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:mt-2 md:font-serif md:text-3xl md:font-bold">
          <span className="md:hidden">Requests</span>
          <span className="hidden md:inline">Incoming requests</span>
        </h2>
        <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
          Accept requests from musicians who want to connect with you.
        </p>
      </div>

      {pendingIncomingRequests.length === 0 ? (
        <EmptyState
          title="No incoming requests"
          description="Friend requests from other musicians will appear here."
        />
      ) : (
        <div className="divide-y divide-border/70 md:space-y-3 md:divide-y-0">
          {pendingIncomingRequests.map((request) => (
            <article
              key={request.connection_id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 md:shadow-sm md:transition md:hover:bg-muted/70"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {renderUserLink(request.username, request.display_name)}
                </p>
                {request.username && (
                  <p className="mt-1 truncate">
                    <UserHandleLink username={request.username} />
                  </p>
                )}
              </div>

              <div className="flex w-full flex-col gap-2 min-[420px]:w-auto min-[420px]:shrink-0 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-end">
                <form
                  action={acceptFriendRequest}
                  className="w-full min-[420px]:w-auto"
                >
                  <input
                    type="hidden"
                    name="connection_id"
                    value={request.connection_id}
                  />
                  <input type="hidden" name="redirect_to" value="/friends" />
                  <SubmitButton
                    label="Accept"
                    pendingLabel="Accepting..."
                    className={joinClasses(
                      buttonStyles.primary,
                      "min-h-9 px-3 py-1.5 text-xs sm:px-4 sm:text-sm"
                    )}
                  />
                </form>
                <form
                  action={declineFriendRequest}
                  className="w-full min-[420px]:w-auto"
                >
                  <input
                    type="hidden"
                    name="connection_id"
                    value={request.connection_id}
                  />
                  <input type="hidden" name="redirect_to" value="/friends" />
                  <SubmitButton
                    label="Refuse"
                    pendingLabel="Refusing..."
                    className={joinClasses(
                      buttonStyles.destructiveSecondary,
                      "min-h-9 px-3 py-1.5 text-xs sm:px-4 sm:text-sm"
                    )}
                  />
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const resolvedSearchParams = await searchParams
  const searchQuery = getSingleValue(resolvedSearchParams?.q)
  const friendRequestStatus = getSingleValue(
    resolvedSearchParams?.friend_request
  )
  const friendAcceptStatus = getSingleValue(resolvedSearchParams?.friend_accept)
  const friendDeclineStatus = getSingleValue(
    resolvedSearchParams?.friend_decline
  )

  const {
    pendingIncomingRequests,
    acceptedFriends,
    searchMatches,
    recentFriendActivity,
  } = await loadFriendsPageData(searchQuery)

  const addFriendsContent = (
    <>
      <SearchResultsSection
        searchQuery={searchQuery}
        searchMatches={searchMatches}
      />

      <IncomingRequestsSection
        pendingIncomingRequests={pendingIncomingRequests}
      />

      <FriendsListSection friends={acceptedFriends} />
    </>
  )

  const activityContent = (
    <RecentFriendActivitySection items={recentFriendActivity} />
  )

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="mb-7 border-b border-border/70 pb-5 md:mb-8 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Friends
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight md:text-4xl">
          Find musicians
        </h1>
        <p className="mt-3 hidden max-w-3xl text-sm leading-6 text-muted-foreground md:block">
          Find musicians, send friend requests, compare repertoire, and see
          activity from people you know.
        </p>
      </section>

      {friendRequestStatus === "sent" && (
        <StatusBanner tone="success">Friend request sent.</StatusBanner>
      )}

      {friendRequestStatus === "missing_user" && (
        <StatusBanner tone="warning">
          Please choose a person from the search results.
        </StatusBanner>
      )}

      {friendRequestStatus === "self" && (
        <StatusBanner tone="warning">
          You cannot send a friend request to yourself.
        </StatusBanner>
      )}

      {friendRequestStatus === "not_found" && (
        <StatusBanner tone="error">That person could not be found.</StatusBanner>
      )}

      {friendRequestStatus === "duplicate" && (
        <StatusBanner tone="neutral">
          A pending or accepted connection already exists with that person.
        </StatusBanner>
      )}

      {friendAcceptStatus === "accepted" && (
        <StatusBanner tone="success">Friend request accepted.</StatusBanner>
      )}

      {friendAcceptStatus === "missing_connection" && (
        <StatusBanner tone="warning">
          Couldn’t tell which friend request to accept.
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

      {friendDeclineStatus === "declined" && (
        <StatusBanner tone="success">Friend request refused.</StatusBanner>
      )}

      {friendDeclineStatus === "missing_connection" && (
        <StatusBanner tone="warning">
          Couldn’t tell which friend request to refuse.
        </StatusBanner>
      )}

      {friendDeclineStatus === "not_found" && (
        <StatusBanner tone="error">
          That friend request could not be found.
        </StatusBanner>
      )}

      {friendDeclineStatus === "forbidden" && (
        <StatusBanner tone="error">
          You are not allowed to refuse that request.
        </StatusBanner>
      )}

      {friendDeclineStatus === "invalid_status" && (
        <StatusBanner tone="warning">
          That request is no longer pending.
        </StatusBanner>
      )}

      <FriendsMobileSwitcher
        addFriendsContent={addFriendsContent}
        activityContent={activityContent}
      />

      <div className="hidden gap-6 md:grid lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="min-w-0">{addFriendsContent}</div>
        <div className="min-w-0 self-start lg:sticky lg:top-24">
          {activityContent}
        </div>
      </div>
    </main>
  )
}

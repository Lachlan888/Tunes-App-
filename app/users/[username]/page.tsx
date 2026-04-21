import Link from "next/link"
import { notFound } from "next/navigation"
import PublicProfileActions from "@/components/PublicProfileActions"
import { loadPublicProfileData } from "@/lib/loaders/profile-public"

type PublicProfilePageProps = {
  params: Promise<{
    username: string
  }>
  searchParams?: Promise<{
    friend_request?: string
    friend_accept?: string
  }>
}

function getFriendRequestMessage(status?: string) {
  if (status === "sent") {
    return {
      tone: "success" as const,
      text: "Friend request sent.",
    }
  }

  if (status === "missing_user") {
    return {
      tone: "warning" as const,
      text: "Could not tell which user to send the request to.",
    }
  }

  if (status === "self") {
    return {
      tone: "warning" as const,
      text: "You cannot send a friend request to yourself.",
    }
  }

  if (status === "not_found") {
    return {
      tone: "error" as const,
      text: "That user could not be found.",
    }
  }

  if (status === "duplicate") {
    return {
      tone: "neutral" as const,
      text: "A pending or accepted connection already exists with that user.",
    }
  }

  return null
}

function getFriendAcceptMessage(status?: string) {
  if (status === "accepted") {
    return {
      tone: "success" as const,
      text: "Friend request accepted.",
    }
  }

  if (status === "missing_connection") {
    return {
      tone: "warning" as const,
      text: "Could not tell which friend request to accept.",
    }
  }

  if (status === "not_found") {
    return {
      tone: "error" as const,
      text: "That friend request could not be found.",
    }
  }

  if (status === "forbidden") {
    return {
      tone: "error" as const,
      text: "You are not allowed to accept that request.",
    }
  }

  if (status === "invalid_status") {
    return {
      tone: "warning" as const,
      text: "That request is no longer pending.",
    }
  }

  return null
}

function getMessageClasses(
  tone: "success" | "warning" | "error" | "neutral"
) {
  if (tone === "success") {
    return "mb-6 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800"
  }

  if (tone === "warning") {
    return "mb-6 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800"
  }

  if (tone === "error") {
    return "mb-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
  }

  return "mb-6 rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-800"
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  const { username } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const {
    profile,
    instruments,
    publicLists,
    repertoireSummary,
    isOwnProfile,
    isAcceptedFriend,
    hasPendingOutgoingRequest,
    hasPendingIncomingRequest,
    pendingIncomingConnectionId,
    canCompare,
    compareBlockedByFriendship,
  } = await loadPublicProfileData(username)

  if (!profile) {
    notFound()
  }

  const redirectTo = `/users/${encodeURIComponent(profile.username)}`
  const friendRequestMessage = getFriendRequestMessage(
    resolvedSearchParams?.friend_request
  )
  const friendAcceptMessage = getFriendAcceptMessage(
    resolvedSearchParams?.friend_accept
  )

  return (
    <main className="p-8">
      {friendRequestMessage && (
        <div className={getMessageClasses(friendRequestMessage.tone)}>
          {friendRequestMessage.text}
        </div>
      )}

      {friendAcceptMessage && (
        <div className={getMessageClasses(friendAcceptMessage.tone)}>
          {friendAcceptMessage.text}
        </div>
      )}

      <header className="rounded border p-6">
        <h1 className="text-3xl font-bold">
          {profile.show_identity
            ? profile.display_name || profile.username
            : "User profile"}
        </h1>

        {profile.show_identity && (
          <p className="mt-2 text-gray-600">@{profile.username}</p>
        )}

        {profile.show_identity && profile.bio && (
          <p className="mt-4 whitespace-pre-wrap text-gray-700">{profile.bio}</p>
        )}
      </header>

      <PublicProfileActions
        username={profile.username}
        profileUserId={profile.id}
        redirectTo={redirectTo}
        isOwnProfile={isOwnProfile}
        isAcceptedFriend={isAcceptedFriend}
        hasPendingOutgoingRequest={hasPendingOutgoingRequest}
        hasPendingIncomingRequest={hasPendingIncomingRequest}
        pendingIncomingConnectionId={pendingIncomingConnectionId}
        canCompare={canCompare}
        compareBlockedByFriendship={compareBlockedByFriendship}
        showCompareDiscoverability={profile.show_compare_discoverability}
      />

      {profile.show_repertoire_summary && repertoireSummary && (
        <section className="mt-6 rounded border p-4">
          <h2 className="text-xl font-semibold">Repertoire summary</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded border p-3">
              <p className="text-sm text-gray-500">Known tunes</p>
              <p className="mt-1 text-2xl font-semibold">
                {repertoireSummary.known_count}
              </p>
            </div>

            <div className="rounded border p-3">
              <p className="text-sm text-gray-500">In practice</p>
              <p className="mt-1 text-2xl font-semibold">
                {repertoireSummary.practice_count}
              </p>
            </div>
          </div>
        </section>
      )}

      {profile.show_instruments && (
        <section className="mt-6 rounded border p-4">
          <h2 className="text-xl font-semibold">
            Instruments ({instruments.length})
          </h2>

          {instruments.length > 0 ? (
            <ul className="mt-4 list-disc pl-5 text-gray-700">
              {instruments.map((instrument) => (
                <li key={instrument.id}>{instrument.instrument_name}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-600">No instruments listed.</p>
          )}
        </section>
      )}

      {profile.show_public_lists_on_profile && (
        <section className="mt-6 rounded border p-4">
          <h2 className="text-xl font-semibold">
            Public lists ({publicLists.length})
          </h2>

          {publicLists.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {publicLists.map((list) => (
                <li key={list.id} className="rounded border p-3">
                  <Link
                    href={`/public-lists/${list.id}`}
                    className="font-medium underline hover:no-underline"
                  >
                    {list.name}
                  </Link>

                  {list.description && (
                    <p className="mt-1 text-gray-600">{list.description}</p>
                  )}

                  <p className="mt-2 text-sm text-gray-500">
                    {list.tune_count} {list.tune_count === 1 ? "tune" : "tunes"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-600">No public lists yet.</p>
          )}
        </section>
      )}
    </main>
  )
}
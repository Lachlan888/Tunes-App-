import { notFound } from "next/navigation"
import PublicProfileActions from "@/components/PublicProfileActions"
import PublicProfileHeader from "@/components/profile/PublicProfileHeader"
import PublicProfileOverview from "@/components/profile/PublicProfileOverview"
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

      <PublicProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

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

      <PublicProfileOverview
        profile={profile}
        instruments={instruments}
        publicLists={publicLists}
        repertoireSummary={repertoireSummary}
      />
    </main>
  )
}
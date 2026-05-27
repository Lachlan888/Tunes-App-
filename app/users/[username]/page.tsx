import { notFound } from "next/navigation"
import PublicProfileActions from "@/components/profile/PublicProfileActions"
import PublicProfileBadgesSection from "@/components/profile/PublicProfileBadgesSection"
import PublicProfileComposedTunesSection from "@/components/profile/PublicProfileComposedTunesSection"
import PublicProfileHeader from "@/components/profile/PublicProfileHeader"
import PublicProfileOverview from "@/components/profile/PublicProfileOverview"
import PublicProfileRepertoireSection from "@/components/profile/PublicProfileRepertoireSection"
import { addToLearningList } from "@/lib/actions/lists"
import { loadPublicProfileData } from "@/lib/loaders/profile-public"

type PublicProfilePageProps = {
  params: Promise<{
    username: string
  }>
  searchParams?: Promise<{
    friend_request?: string
    friend_accept?: string
    direct_message?: string
    list_add?: string
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

function getDirectMessageMessage(status?: string) {
  if (status === "sent") {
    return {
      tone: "success" as const,
      text: "Message sent.",
    }
  }

  if (status === "missing_user") {
    return {
      tone: "warning" as const,
      text: "Could not tell which user to message.",
    }
  }

  if (status === "missing_body") {
    return {
      tone: "warning" as const,
      text: "Write a message before sending.",
    }
  }

  if (status === "self") {
    return {
      tone: "warning" as const,
      text: "You cannot send a direct message to yourself.",
    }
  }

  if (status === "not_found") {
    return {
      tone: "error" as const,
      text: "That user could not be found.",
    }
  }

  return null
}

function getListAddMessage(status?: string) {
  if (status === "success") {
    return {
      tone: "success" as const,
      text: "Tune added to your list.",
    }
  }

  if (status === "duplicate") {
    return {
      tone: "neutral" as const,
      text: "That tune is already in the selected list.",
    }
  }

  return null
}

function getMessageClasses(
  tone: "success" | "warning" | "error" | "neutral"
) {
  if (tone === "success") {
    return "mb-6 rounded-2xl border border-success bg-muted p-4 text-sm font-medium text-foreground shadow-sm"
  }

  if (tone === "warning") {
    return "mb-6 rounded-2xl border border-warning bg-muted p-4 text-sm font-medium text-foreground shadow-sm"
  }

  if (tone === "error") {
    return "mb-6 rounded-2xl border border-destructive bg-muted p-4 text-sm font-medium text-destructive shadow-sm"
  }

  return "mb-6 rounded-2xl border border-border bg-muted p-4 text-sm font-medium text-muted-foreground shadow-sm"
}

function profileDisplayName(profile: {
  username: string
  display_name: string | null
}) {
  return profile.display_name || profile.username
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  const { username } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const {
    viewerId,
    profile,
    instruments,
    publicLists,
    repertoireSummary,
    composedTunes,
    profileRepertoireTunes,
    viewerLearningLists,
    createdBadges,
    receivedBadges,
    isOwnProfile,
    isAcceptedFriend,
    hasPendingOutgoingRequest,
    hasPendingIncomingRequest,
    pendingIncomingConnectionId,
    canCompare,
    compareBlockedByFriendship,
    canViewFullRepertoire,
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

  const directMessageMessage = getDirectMessageMessage(
    resolvedSearchParams?.direct_message
  )

  const listAddMessage = getListAddMessage(resolvedSearchParams?.list_add)

  return (
    <main className="mx-auto max-w-[1500px] min-w-0 px-4 py-5 text-foreground sm:px-6 md:py-8">
      {friendRequestMessage ? (
        <div className={getMessageClasses(friendRequestMessage.tone)}>
          {friendRequestMessage.text}
        </div>
      ) : null}

      {friendAcceptMessage ? (
        <div className={getMessageClasses(friendAcceptMessage.tone)}>
          {friendAcceptMessage.text}
        </div>
      ) : null}

      {directMessageMessage ? (
        <div className={getMessageClasses(directMessageMessage.tone)}>
          {directMessageMessage.text}
        </div>
      ) : null}

      {listAddMessage ? (
        <div className={getMessageClasses(listAddMessage.tone)}>
          {listAddMessage.text}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-6">
          <PublicProfileHeader profile={profile} isOwnProfile={isOwnProfile} />

          <PublicProfileOverview
            profile={profile}
            instruments={instruments}
            publicLists={publicLists}
            repertoireSummary={repertoireSummary}
            isOwnProfile={isOwnProfile}
          />

          <PublicProfileBadgesSection
            createdBadges={createdBadges}
            receivedBadges={receivedBadges}
            isOwnProfile={isOwnProfile}
            displayName={profileDisplayName(profile)}
          />

          <PublicProfileComposedTunesSection
            tunes={composedTunes}
            displayName={profileDisplayName(profile)}
          />

          <PublicProfileRepertoireSection
            profile={profile}
            tunes={profileRepertoireTunes}
            viewerLearningLists={viewerLearningLists}
            viewerId={viewerId}
            isOwnProfile={isOwnProfile}
            isAcceptedFriend={isAcceptedFriend}
            canViewFullRepertoire={canViewFullRepertoire}
            redirectTo={redirectTo}
            addToLearningList={addToLearningList}
          />
        </div>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <PublicProfileActions
            viewerId={viewerId}
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
        </aside>
      </div>
    </main>
  )
}

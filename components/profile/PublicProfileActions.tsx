import PendingLinkButton from "@/components/PendingLinkButton"
import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { acceptFriendRequest, sendFriendRequest } from "@/lib/actions/friends"

type PublicProfileActionsProps = {
  username: string
  profileUserId: string
  redirectTo: string
  isOwnProfile: boolean
  isAcceptedFriend: boolean
  hasPendingOutgoingRequest: boolean
  hasPendingIncomingRequest: boolean
  pendingIncomingConnectionId: number | null
  canCompare: boolean
  compareBlockedByFriendship: boolean
  showCompareDiscoverability: boolean
}

export default function PublicProfileActions({
  username,
  profileUserId,
  redirectTo,
  isOwnProfile,
  isAcceptedFriend,
  hasPendingOutgoingRequest,
  hasPendingIncomingRequest,
  pendingIncomingConnectionId,
  canCompare,
  compareBlockedByFriendship,
  showCompareDiscoverability,
}: PublicProfileActionsProps) {
  if (isOwnProfile) {
    return (
      <section className="mt-6 rounded border p-4">
        <h2 className="text-xl font-semibold">Your profile</h2>
        <p className="mt-3 text-gray-600">
          This is your public profile as other users would see it.
        </p>
        <div className="mt-4">
          <PendingLinkButton
            href="/dashboard"
            label="Edit profile"
            pendingLabel="Opening..."
            className="inline-flex rounded border px-4 py-2 text-sm font-medium"
          />
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6 rounded border p-4">
      <h2 className="text-xl font-semibold">Connect</h2>

      <div className="mt-4 flex flex-wrap gap-3">
        {canCompare && (
          <PendingLinkButton
            href={`/compare?user=${encodeURIComponent(username)}`}
            label="Compare with this user"
            pendingLabel="Opening..."
            className="inline-flex rounded border px-4 py-2 text-sm font-medium"
          />
        )}

        {isAcceptedFriend ? (
          <span className="inline-flex items-center rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
            Friends
          </span>
        ) : hasPendingOutgoingRequest ? (
          <span className="inline-flex items-center rounded border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700">
            Friend request sent
          </span>
        ) : hasPendingIncomingRequest && pendingIncomingConnectionId ? (
          <form action={acceptFriendRequest}>
            <input
              type="hidden"
              name="connection_id"
              value={pendingIncomingConnectionId}
            />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <SubmitButton
              label="Accept friend request"
              pendingLabel="Accepting..."
              className="rounded border px-4 py-2 text-sm font-medium"
            />
          </form>
        ) : (
          <form action={sendFriendRequest}>
            <input type="hidden" name="addressee_id" value={profileUserId} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <SubmitButton
              label="Send friend request"
              pendingLabel="Sending..."
              className="rounded border px-4 py-2 text-sm font-medium"
            />
          </form>
        )}
      </div>

      {compareBlockedByFriendship && (
        <p className="mt-4 text-sm text-gray-600">
          Comparison is available once you are friends.
        </p>
      )}

      {!showCompareDiscoverability && (
        <p className="mt-4 text-sm text-gray-600">
          This user is not discoverable through compare.
        </p>
      )}
    </section>
  )
}
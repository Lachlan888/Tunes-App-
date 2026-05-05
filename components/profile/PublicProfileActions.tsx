import PendingLinkButton from "@/components/PendingLinkButton"
import SubmitButton from "@/components/SubmitButton"
import { acceptFriendRequest, sendFriendRequest } from "@/lib/actions/friends"
import { sendDirectMessage } from "@/lib/actions/direct-messages"

type PublicProfileActionsProps = {
  viewerId: string | null
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

const primaryButtonClass =
  "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const secondaryButtonClass =
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PublicProfileActions({
  viewerId,
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
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your profile
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This is your public profile as other users would see it.
        </p>
        <div className="mt-4">
          <PendingLinkButton
            href="/dashboard"
            label="Edit profile"
            pendingLabel="Opening..."
            className={secondaryButtonClass}
          />
        </div>
      </section>
    )
  }

  if (!viewerId) {
    return (
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Connect
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Log in to send a message, connect, or compare repertoire.
        </p>
        <div className="mt-4">
          <PendingLinkButton
            href="/login"
            label="Log in"
            pendingLabel="Opening..."
            className={primaryButtonClass}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Connect
      </h2>

      <div className="mt-4 flex flex-wrap gap-3">
        {canCompare && (
          <PendingLinkButton
            href={`/compare?user=${encodeURIComponent(username)}`}
            label="Compare"
            pendingLabel="Opening..."
            className={secondaryButtonClass}
          />
        )}

        {isAcceptedFriend ? (
          <span className="inline-flex items-center rounded-full border border-success bg-muted px-4 py-2 text-sm font-medium text-foreground">
            Friends
          </span>
        ) : hasPendingOutgoingRequest ? (
          <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground">
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
              className={primaryButtonClass}
            />
          </form>
        ) : (
          <form action={sendFriendRequest}>
            <input type="hidden" name="addressee_id" value={profileUserId} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <SubmitButton
              label="Send friend request"
              pendingLabel="Sending..."
              className={secondaryButtonClass}
            />
          </form>
        )}
      </div>

      <details className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          Message this user
        </summary>

        <form action={sendDirectMessage} className="mt-4 space-y-3">
          <input type="hidden" name="recipient_user_id" value={profileUserId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <textarea
            name="body"
            rows={4}
            placeholder="Write a direct message"
            className={inputClassName}
            required
          />

          <SubmitButton
            label="Send message"
            pendingLabel="Sending..."
            className={primaryButtonClass}
          />
        </form>
      </details>

      {compareBlockedByFriendship && (
        <p className="mt-4 text-sm text-muted-foreground">
          Comparison is available once you are friends.
        </p>
      )}

      {!showCompareDiscoverability && (
        <p className="mt-4 text-sm text-muted-foreground">
          This user is not discoverable through compare.
        </p>
      )}
    </section>
  )
}
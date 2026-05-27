import { AutoGrowMessageTextarea } from "@/components/profile/AutoGrowMessageTextarea"
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
  "max-w-full rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const secondaryButtonClass =
  "max-w-full rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const textareaClassName =
  "max-h-[22rem] min-h-28 w-full resize-none overflow-hidden rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

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
      <section className="min-w-0 max-w-full rounded-2xl bg-card p-4 shadow-sm md:rounded-3xl md:border md:border-border md:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your profile
        </h2>

        <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
          Edit your name, bio, instruments, visibility, and public repertoire
          settings from your private profile page.
        </p>

        <div className="mt-5">
          <PendingLinkButton
            href="/dashboard"
            label="Edit profile"
            pendingLabel="Opening..."
            className={primaryButtonClass}
          />
        </div>
      </section>
    )
  }

  if (!viewerId) {
    return (
      <section className="min-w-0 max-w-full rounded-2xl bg-card p-4 shadow-sm md:rounded-3xl md:border md:border-border md:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Connect
        </h2>

        <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
          Log in to message this musician, send a friend request, or compare
          repertoire.
        </p>

        <div className="mt-5">
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
    <section className="min-w-0 max-w-full rounded-2xl bg-card p-4 shadow-sm md:rounded-3xl md:border md:border-border md:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Connect
      </h2>

      <div className="mt-5 flex min-w-0 flex-wrap gap-3">
        {canCompare ? (
          <PendingLinkButton
            href={`/compare?user=${encodeURIComponent(username)}`}
            label="Compare repertoire"
            pendingLabel="Opening..."
            className={secondaryButtonClass}
          />
        ) : null}

        {isAcceptedFriend ? (
          <span className="inline-flex max-w-full items-center rounded-full border border-success bg-muted px-4 py-2 text-sm font-medium text-foreground">
            Friends
          </span>
        ) : hasPendingOutgoingRequest ? (
          <span className="inline-flex max-w-full items-center rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground">
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

      {compareBlockedByFriendship ? (
        <p className="mt-4 break-words border-t border-border pt-3 text-sm leading-6 text-muted-foreground md:rounded-2xl md:border md:bg-background/70 md:p-3">
          Comparison is available once you are friends.
        </p>
      ) : null}

      {!showCompareDiscoverability ? (
        <p className="mt-4 break-words border-t border-border pt-3 text-sm leading-6 text-muted-foreground md:rounded-2xl md:border md:bg-background/70 md:p-3">
          This user is not discoverable through compare.
        </p>
      ) : null}

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Message
        </h3>

        <form action={sendDirectMessage} className="mt-4 space-y-3">
          <input type="hidden" name="recipient_user_id" value={profileUserId} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <AutoGrowMessageTextarea
            name="body"
            rows={4}
            placeholder="Write a direct message..."
            className={textareaClassName}
            required
          />

          <SubmitButton
            label="Send message"
            pendingLabel="Sending..."
            className={primaryButtonClass}
          />
        </form>
      </div>
    </section>
  )
}

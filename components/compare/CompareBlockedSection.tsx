"use client"

import SubmitButton from "@/components/SubmitButton"
import UserIdentityLink from "@/components/UserIdentityLink"
import { sendFriendRequest } from "@/lib/actions/friends"
import type { ProfileSearchRow } from "@/lib/profile-search"

type CompareBlockedSectionProps = {
  matchedProfile: ProfileSearchRow
  isAcceptedFriend: boolean
  redirectTo: string
}

const secondaryButtonClass =
  "inline-flex min-h-11 rounded-control border border-border bg-surface-paper px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 items-center justify-center"

export default function CompareBlockedSection({
  matchedProfile,
  isAcceptedFriend,
  redirectTo,
}: CompareBlockedSectionProps) {
  const profileHref = matchedProfile.username
    ? `/users/${encodeURIComponent(matchedProfile.username)}`
    : null

  return (
    <section className="mb-8 border-y border-hairline py-5">
      <div className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Player found
        </h2>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">Friend request needed</p>
      </div>

      <article
        className={
          profileHref
            ? "flex flex-col gap-4 border-y border-hairline py-4 transition focus-within:ring-2 focus-within:ring-[var(--focus-ring)] md:flex-row md:items-center md:justify-between"
            : "flex flex-col gap-4 border-y border-hairline py-4 md:flex-row md:items-center md:justify-between"
        }

      >
        <div>
          <p className="font-medium text-foreground">
            <UserIdentityLink
              username={matchedProfile.username}
              displayName={matchedProfile.display_name}
              fallbackLabel="Unnamed player"
              className="decoration-primary decoration-2 underline-offset-4 hover:underline"
            />
          </p>

          {matchedProfile.username && (
            <p className="mt-1 text-sm text-muted-foreground">
              <UserIdentityLink
                username={matchedProfile.username}
                displayName={matchedProfile.display_name}
                showHandle
              />
            </p>
          )}
        </div>

        {!isAcceptedFriend && (
          <form action={sendFriendRequest} data-card-action>
            <input type="hidden" name="addressee_id" value={matchedProfile.id} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <SubmitButton
              label="Send request"
              pendingLabel="Sending..."
              className={secondaryButtonClass}
            />
          </form>
        )}
      </article>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        This player only allows friends to compare repertoire with them.
      </p>
    </section>
  )
}

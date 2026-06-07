"use client"

import { useRouter } from "next/navigation"
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
  "rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"

function clickedInsideInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest(
      [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "label",
        "summary",
        "details",
        "form",
        "[role='button']",
        "[data-card-action]",
      ].join(", ")
    )
  )
}

export default function CompareBlockedSection({
  matchedProfile,
  isAcceptedFriend,
  redirectTo,
}: CompareBlockedSectionProps) {
  const router = useRouter()
  const label =
    matchedProfile.display_name || matchedProfile.username || "Unnamed player"
  const profileHref = matchedProfile.username
    ? `/users/${encodeURIComponent(matchedProfile.username)}`
    : null

  function openProfile(event: React.MouseEvent<HTMLElement>) {
    if (!profileHref) return
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(profileHref)
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Friend request needed
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground">
          Player found
        </h2>
      </div>

      <article
        className={
          profileHref
            ? "flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/70 hover:shadow-md focus-within:ring-2 focus-within:ring-[var(--focus-ring)] md:flex-row md:items-center md:justify-between"
            : "flex flex-col gap-4 rounded-2xl border border-border bg-background/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
        }
        onClick={openProfile}
        aria-label={profileHref ? `Open profile for ${label}` : undefined}
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

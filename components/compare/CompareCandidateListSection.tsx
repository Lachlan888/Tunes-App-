"use client"

import SubmitButton from "@/components/SubmitButton"
import PendingLinkButton from "@/components/PendingLinkButton"
import UserIdentityLink from "@/components/UserIdentityLink"
import { sendFriendRequest } from "@/lib/actions/friends"
import type { ProfileSearchRow, RankedProfileMatch } from "@/lib/profile-search"
import {
  addConfirmedCompareUser,
  buildCompareHref,
} from "@/lib/compare-page"

type CompareCandidateProfile = ProfileSearchRow | RankedProfileMatch

type CompareCandidateListSectionProps = {
  title: string
  description?: string
  profiles: CompareCandidateProfile[]
  filterPreservedUsers: string[]
  includePractice: boolean
  redirectTo: string
}

const primaryButtonClass =
  "inline-flex min-h-11 rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"

const secondaryButtonClass =
  "inline-flex min-h-11 rounded-control border border-border bg-surface-paper px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60 items-center justify-center"

function CandidateCard({
  profile,
  filterPreservedUsers,
  includePractice,
  redirectTo,
}: {
  profile: CompareCandidateProfile
  filterPreservedUsers: string[]
  includePractice: boolean
  redirectTo: string
}) {
  const profileHref = profile.username
    ? `/users/${encodeURIComponent(profile.username)}`
    : null

  const nextUsers = addConfirmedCompareUser(
    filterPreservedUsers,
    profile.username ?? ""
  )

  return (
    <article
      className={
        profileHref
          ? "flex flex-col gap-4 py-4 transition focus-within:ring-2 focus-within:ring-[var(--focus-ring)] md:flex-row md:items-center md:justify-between"
          : "flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
      }

    >
      <div>
        <p className="text-base font-semibold text-foreground">
          <UserIdentityLink
            username={profile.username}
            displayName={profile.display_name}
            fallbackLabel="Unnamed player"
            className="decoration-primary decoration-2 underline-offset-4 hover:underline"
          />
        </p>

        {profile.username ? (
          <p className="mt-1">
            <UserIdentityLink
              username={profile.username}
              displayName={profile.display_name}
              showHandle
            />
          </p>
        ) : null}
      </div>

      <div data-card-action className="flex flex-wrap gap-2">
        {profile.username ? (
          <PendingLinkButton
            href={buildCompareHref(nextUsers, { includePractice })}
            label="Add to compare"
            pendingLabel="Loading..."
            className={primaryButtonClass}
            refresh
          />
        ) : (
          <span className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm text-muted-foreground">
            No username available
          </span>
        )}

        <form action={sendFriendRequest}>
          <input type="hidden" name="addressee_id" value={profile.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <SubmitButton
            label="Send request"
            pendingLabel="Sending..."
            className={secondaryButtonClass}
          />
        </form>
      </div>
    </article>
  )
}

export default function CompareCandidateListSection({
  title,
  description,
  profiles,
  filterPreservedUsers,
  includePractice,
  redirectTo,
}: CompareCandidateListSectionProps) {
  if (profiles.length === 0) {
    return null
  }

  return (
    <section className="mb-8 border-t border-hairline pt-5">
      <h2 className="text-xl font-semibold text-foreground">
        {title}
      </h2>

      {description ? (
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}

      <div className="mt-4 divide-y divide-hairline border-y border-hairline">
        {profiles.map((profile) => (
          <CandidateCard
            key={profile.id}
            profile={profile}
            filterPreservedUsers={filterPreservedUsers}
            includePractice={includePractice}
            redirectTo={redirectTo}
          />
        ))}
      </div>
    </section>
  )
}

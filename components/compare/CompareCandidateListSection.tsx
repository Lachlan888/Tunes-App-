"use client"

import { useRouter } from "next/navigation"
import SubmitButton from "@/components/SubmitButton"
import PendingLinkButton from "@/components/PendingLinkButton"
import UserIdentityLink from "@/components/UserIdentityLink"
import { sendFriendRequest } from "@/lib/actions/friends"
import type { ProfileSearchRow, RankedProfileMatch } from "@/lib/profile-search"
import { buildCompareHref, removeUserOnce } from "@/lib/compare-page"

type CompareCandidateProfile = ProfileSearchRow | RankedProfileMatch

type CompareCandidateListSectionProps = {
  title: string
  description: string
  profiles: CompareCandidateProfile[]
  primarySearchValue: string
  filterPreservedUsers: string[]
  redirectTo: string
}

const primaryButtonClass =
  "rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

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

function CandidateCard({
  profile,
  primarySearchValue,
  filterPreservedUsers,
  redirectTo,
}: {
  profile: CompareCandidateProfile
  primarySearchValue: string
  filterPreservedUsers: string[]
  redirectTo: string
}) {
  const router = useRouter()
  const label = profile.display_name || profile.username || "Unnamed player"
  const profileHref = profile.username
    ? `/users/${encodeURIComponent(profile.username)}`
    : null

  const nextUsers = [
    ...removeUserOnce(filterPreservedUsers, primarySearchValue),
    profile.username ?? "",
  ].filter(Boolean)

  function openProfile(event: React.MouseEvent<HTMLElement>) {
    if (!profileHref) return
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(profileHref)
  }

  return (
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
            href={buildCompareHref(nextUsers)}
            label="Add to compare"
            pendingLabel="Loading..."
            className={primaryButtonClass}
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
  primarySearchValue,
  filterPreservedUsers,
  redirectTo,
}: CompareCandidateListSectionProps) {
  if (profiles.length === 0) {
    return null
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>

      <p className="mt-3 text-sm text-muted-foreground md:text-base">
        {description}
      </p>

      <div className="mt-5 space-y-3">
        {profiles.map((profile) => (
          <CandidateCard
            key={profile.id}
            profile={profile}
            primarySearchValue={primarySearchValue}
            filterPreservedUsers={filterPreservedUsers}
            redirectTo={redirectTo}
          />
        ))}
      </div>
    </section>
  )
}
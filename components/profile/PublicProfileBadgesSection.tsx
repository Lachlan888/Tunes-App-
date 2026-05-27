"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type {
  PublicProfileCreatedBadge,
  PublicProfileReceivedBadge,
} from "@/lib/types"

type PublicProfileBadgesSectionProps = {
  createdBadges: PublicProfileCreatedBadge[]
  receivedBadges: PublicProfileReceivedBadge[]
  isOwnProfile: boolean
  displayName: string
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

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

function BadgeLinkCard({
  href,
  title,
  meta,
  description,
}: {
  href: string
  title: string
  meta: React.ReactNode
  description?: string | null
}) {
  const router = useRouter()

  function openBadge(event: React.MouseEvent<HTMLElement>) {
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(href)
  }

  return (
    <article
      className="group cursor-pointer rounded-xl bg-card p-4 transition hover:bg-muted focus-within:ring-2 focus-within:ring-[var(--focus-ring)] md:rounded-2xl md:border md:border-border md:bg-background/70 md:hover:-translate-y-0.5 md:hover:shadow-md"
      onClick={openBadge}
      aria-label={`Open badge ${title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="break-words font-semibold">
            <Link href={href} className="underline-offset-4 hover:underline">
              {title}
            </Link>
          </p>
          <div className="mt-1 break-words text-sm text-muted-foreground">
            {meta}
          </div>
          {description ? (
            <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <span
          aria-hidden="true"
          className="text-sm text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
        >
          →
        </span>
      </div>
    </article>
  )
}

function AwardedByLink({
  profile,
}: {
  profile: PublicProfileReceivedBadge["awarded_by_profile"]
}) {
  const label = profile?.display_name || profile?.username || "Unknown user"

  if (!profile?.username) {
    return <span>{label}</span>
  }

  return (
    <Link
      href={`/users/${encodeURIComponent(profile.username)}`}
      className="font-medium text-foreground underline underline-offset-4 transition hover:text-primary"
    >
      {label}
    </Link>
  )
}

export default function PublicProfileBadgesSection({
  createdBadges,
  receivedBadges,
  isOwnProfile,
  displayName,
}: PublicProfileBadgesSectionProps) {
  const ownerLabel = isOwnProfile ? "You" : displayName

  return (
    <section className="min-w-0 max-w-full md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Badges
          </p>
          <h2 className="mt-2 break-words font-serif text-2xl font-bold leading-tight tracking-tight text-foreground md:mt-3 md:text-3xl">
            Recognition
          </h2>
          <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-muted-foreground">
            Badges {ownerLabel.toLowerCase()} award and badges{" "}
            {isOwnProfile ? "you have" : "they have"} received.
          </p>
        </div>

        <Link
          href="/badges"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          Browse badges
        </Link>
      </div>

      <div className="mt-4 grid gap-5 md:mt-6 xl:grid-cols-2">
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Badges awarded
            </h3>
            <p className="text-sm text-muted-foreground">
              {createdBadges.length}
            </p>
          </div>

          {createdBadges.length === 0 ? (
            <p className="break-words border-t border-border pt-3 text-sm leading-6 text-muted-foreground md:rounded-2xl md:border md:bg-background/70 md:p-4">
              {isOwnProfile
                ? "You have not created any badges yet."
                : `${displayName} has not created any badges yet.`}
            </p>
          ) : (
            <div className="space-y-3">
              {createdBadges.map((badge) => (
                <BadgeLinkCard
                  key={badge.id}
                  href={`/badges/${encodeURIComponent(badge.slug)}`}
                  title={badge.name}
                  meta={`${titleCase(badge.category)} · awarded ${
                    badge.recipient_count
                  } time${badge.recipient_count === 1 ? "" : "s"}`}
                  description={badge.description}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Badges received
            </h3>
            <p className="text-sm text-muted-foreground">
              {receivedBadges.length}
            </p>
          </div>

          {receivedBadges.length === 0 ? (
            <p className="break-words border-t border-border pt-3 text-sm leading-6 text-muted-foreground md:rounded-2xl md:border md:bg-background/70 md:p-4">
              {isOwnProfile
                ? "You have not received any badges yet."
                : `${displayName} has not received any badges yet.`}
            </p>
          ) : (
            <div className="space-y-3">
              {receivedBadges.map((award) => (
                <BadgeLinkCard
                  key={award.award_id}
                  href={`/badges/${encodeURIComponent(award.badge.slug)}`}
                  title={award.badge.name}
                  meta={
                    <>
                      {titleCase(award.badge.category)} · awarded by{" "}
                      <AwardedByLink profile={award.awarded_by_profile} />
                    </>
                  }
                  description={award.badge.description}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

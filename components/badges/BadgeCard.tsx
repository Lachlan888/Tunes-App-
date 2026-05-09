"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import BadgeProgressSummary from "@/components/badges/BadgeProgressSummary"
import { cardStyles } from "@/components/ui/cardStyles"
import type { BadgeWithOwner } from "@/lib/types"

type BadgeCardProps = {
  badge: BadgeWithOwner
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getOwnerName(badge: BadgeWithOwner) {
  return (
    badge.owner_profile?.display_name ||
    badge.owner_profile?.username ||
    "Unknown user"
  )
}

function getOwnerHref(badge: BadgeWithOwner) {
  return badge.owner_profile?.username
    ? `/users/${encodeURIComponent(badge.owner_profile.username)}`
    : null
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

export default function BadgeCard({ badge }: BadgeCardProps) {
  const router = useRouter()
  const badgeHref = `/badges/${encodeURIComponent(badge.slug)}`
  const ownerHref = getOwnerHref(badge)
  const ownerName = getOwnerName(badge)

  function openBadgePage(event: React.MouseEvent<HTMLElement>) {
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(badgeHref)
  }

  return (
    <article
      className={cardStyles.clickableCard}
      onClick={openBadgePage}
      aria-label={`Open badge ${badge.name}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {titleCase(badge.category)} badge
          </p>

          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-foreground">
            <Link href={badgeHref} className="underline-offset-4 hover:underline">
              {badge.name}
            </Link>
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Awarded by{" "}
            {ownerHref ? (
              <Link
                href={ownerHref}
                className="font-medium text-foreground underline underline-offset-4 transition hover:text-primary"
              >
                {ownerName}
              </Link>
            ) : (
              <span>{ownerName}</span>
            )}
          </p>
        </div>

        <p className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {badge.recipient_count} recipient
          {badge.recipient_count === 1 ? "" : "s"}
        </p>
      </div>

      {badge.description ? (
        <p className="mt-4 text-sm leading-6 text-foreground">
          {badge.description}
        </p>
      ) : null}

      <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Condition
        </p>
        <p className="mt-2 text-sm leading-6 text-foreground">
          {badge.condition_summary}
        </p>
      </div>

      <div data-card-action className="mt-5">
        <BadgeProgressSummary
          viewerAward={badge.viewer_award}
          progress={badge.viewer_progress}
        />
      </div>
    </article>
  )
}
"use client"

import Link from "next/link"
import { publicListHref } from "@/lib/list-return"
import PendingLinkButton from "@/components/PendingLinkButton"
import EditorialListCard from "@/components/lists/EditorialListCard"
import type { SharedList } from "@/lib/loaders/public-lists"

type SharedListCardProps = {
  list: SharedList
  redirectTo?: string
}

function styleLabel(list: SharedList) {
  if (!list.dominantStyle) return null

  return list.dominantStyle
}

export default function SharedListCard({ list, redirectTo = "/public-lists" }: SharedListCardProps) {
  const listHref = publicListHref(list.id, redirectTo)
  const ownerHref = list.ownerUsername
    ? `/users/${encodeURIComponent(list.ownerUsername)}`
    : null
  const displayedStyle = styleLabel(list)

  return (
    <EditorialListCard id={list.id} title={list.name} href={listHref}>
          <p className="text-sm font-semibold">{list.isOwnedByCurrentUser ? "Your public list" : "Public list"}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted-foreground">
            <span>
              By{" "}
              {ownerHref ? (
                <Link
                  href={ownerHref}
                  className="font-medium text-foreground underline underline-offset-4 transition hover:text-primary"
                >
                  {list.ownerLabel}
                </Link>
              ) : (
                list.ownerLabel
              )}
            </span>
            <span aria-hidden="true">•</span>
            <span>
              {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
            </span>
            {displayedStyle ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{displayedStyle}</span>
              </>
            ) : null}
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-foreground">
            {list.description || `A ${displayedStyle ? `${displayedStyle.toLowerCase()} ` : ""}collection curated for players looking for their next session.`}
          </p>

          <div data-card-action className="mt-5">
            <PendingLinkButton
              href={listHref}
              label="Read the list"
              pendingLabel="Opening..."
              className="min-h-11 inline-flex items-center justify-center rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
    </EditorialListCard>
  )
}

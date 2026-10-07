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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-muted-foreground">
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
            {list.isOwnedByCurrentUser ? <span className="font-semibold text-text-primary">Yours</span> : null}
          </div>

          {list.description ? <p className="line-clamp-3 text-sm leading-6 text-foreground">{list.description}</p> : null}

          <div data-card-action>
            <PendingLinkButton
              href={listHref}
              label="Read the list"
              pendingLabel="Opening..."
              className="inline-flex min-h-11 items-center text-sm font-semibold text-action-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            />
          </div>
    </EditorialListCard>
  )
}

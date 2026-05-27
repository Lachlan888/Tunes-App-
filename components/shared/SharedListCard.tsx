"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import PendingLinkButton from "@/components/PendingLinkButton"
import { cardStyles } from "@/components/ui/cardStyles"
import type { SharedList } from "@/lib/loaders/public-lists"

type SharedListCardProps = {
  list: SharedList
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

function styleLabel(list: SharedList) {
  if (!list.dominantStyle) return null

  return list.dominantStyle
}

export default function SharedListCard({ list }: SharedListCardProps) {
  const router = useRouter()
  const listHref = `/public-lists/${list.id}`
  const ownerHref = list.ownerUsername
    ? `/users/${encodeURIComponent(list.ownerUsername)}`
    : null
  const displayedStyle = styleLabel(list)

  function openListPage(event: React.MouseEvent<HTMLElement>) {
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(listHref)
  }

  return (
    <article
      className={cardStyles.clickableCard}
      onClick={openListPage}
      aria-label={`Open public list ${list.name}`}
    >
      <div className="flex h-full flex-col gap-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold leading-tight text-foreground">
              <PendingLinkButton
                href={listHref}
                label={list.name}
                pendingLabel="Opening..."
                className="decoration-primary decoration-2 underline-offset-4 hover:underline"
              />
            </h2>

            {list.isOwnedByCurrentUser && (
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                Your public list
              </span>
            )}
          </div>

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

          {list.description ? (
            <p className="mt-4 text-sm leading-6 text-foreground">
              {list.description}
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No description yet.
            </p>
          )}
        </div>

        <div data-card-action>
          <PendingLinkButton
            href={listHref}
            label="Browse and bookmark"
            pendingLabel="Opening..."
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
      </div>
    </article>
  )
}

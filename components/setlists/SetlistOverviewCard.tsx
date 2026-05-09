"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { cardStyles } from "@/components/ui/cardStyles"
import type { SetlistOverview } from "@/lib/types"

type SetlistOverviewCardProps = {
  setlist: SetlistOverview
}

function pluralise(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
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

export default function SetlistOverviewCard({
  setlist,
}: SetlistOverviewCardProps) {
  const router = useRouter()
  const setlistHref = `/setlists/${setlist.id}`

  function openSetlistPage(event: React.MouseEvent<HTMLElement>) {
    if (clickedInsideInteractiveElement(event.target)) return
    router.push(setlistHref)
  }

  return (
    <article
      className={cardStyles.clickableCard}
      onClick={openSetlistPage}
      aria-label={`Open setlist ${setlist.name}`}
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground">
              <Link
                href={setlistHref}
                className="decoration-primary decoration-2 underline-offset-4 hover:underline"
              >
                {setlist.name}
              </Link>
            </h3>

            {setlist.isCreator ? (
              <span className="rounded-full border border-primary bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                Creator
              </span>
            ) : null}
          </div>

          {setlist.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {setlist.description}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              No description yet.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground">
            {pluralise(setlist.tuneCount, "tune")}
          </span>

          <span className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground">
            {pluralise(setlist.memberCount, "collaborator")}
          </span>

          <span className="rounded-full border border-success bg-success px-3 py-1.5 font-medium text-success-foreground">
            {setlist.knownByEveryoneCount} known by everyone
          </span>

          <span className="rounded-full border border-warning-strong bg-card px-3 py-1.5 font-medium text-muted-foreground">
            {setlist.gapTuneCount} with gaps
          </span>
        </div>

        {setlist.event_date || setlist.location ? (
          <p className="text-sm text-muted-foreground">
            {[setlist.event_date, setlist.location].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        <div data-card-action>
          <Link
            href={setlistHref}
            className="inline-flex rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            View setlist
          </Link>
        </div>
      </div>
    </article>
  )
}
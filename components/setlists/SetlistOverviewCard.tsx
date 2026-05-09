import Link from "next/link"
import type { SetlistOverview } from "@/lib/types"

type SetlistOverviewCardProps = {
  setlist: SetlistOverview
}

function pluralise(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export default function SetlistOverviewCard({
  setlist,
}: SetlistOverviewCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:shadow-md">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground">
              {setlist.name}
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

        {(setlist.event_date || setlist.location) ? (
          <p className="text-sm text-muted-foreground">
            {[setlist.event_date, setlist.location].filter(Boolean).join(" · ")}
          </p>
        ) : null}

        <div>
          <Link
            href={`/setlists/${setlist.id}`}
            className="inline-flex rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            View setlist
          </Link>
        </div>
      </div>
    </article>
  )
}
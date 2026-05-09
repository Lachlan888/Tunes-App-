import Link from "next/link"
import type { SetlistOverview } from "@/lib/types"

type SetlistOverviewCardProps = {
  setlist: SetlistOverview
}

export default function SetlistOverviewCard({
  setlist,
}: SetlistOverviewCardProps) {
  return (
    <Link
      href={`/setlists/${setlist.id}`}
      className="block rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
    >
      <article>
        <div className="min-w-0">
          <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            {setlist.name}
          </h3>

          {setlist.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {setlist.description}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No description yet.
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <span>
              {setlist.memberCount} collaborator
              {setlist.memberCount === 1 ? "" : "s"}
            </span>
            <span>•</span>
            <span>
              {setlist.tuneCount} tune
              {setlist.tuneCount === 1 ? "" : "s"}
            </span>

            {setlist.event_date ? (
              <>
                <span>•</span>
                <span>{setlist.event_date}</span>
              </>
            ) : null}
          </div>

          {setlist.location ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {setlist.location}
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="font-semibold text-foreground">
              {setlist.knownByEveryoneCount}
            </p>
            <p className="text-muted-foreground">Known by everyone</p>
          </div>

          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="font-semibold text-foreground">
              {setlist.gapTuneCount}
            </p>
            <p className="text-muted-foreground">Tunes with gaps</p>
          </div>
        </div>
      </article>
    </Link>
  )
}
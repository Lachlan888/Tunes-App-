import Link from "next/link"
import type { SetlistOverview } from "@/lib/types"

function pluralise(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export default function SetlistOverviewCard({ setlist }: { setlist: SetlistOverview }) {
  return (
    <article className="grid gap-3 border-b border-hairline py-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-2xl font-bold tracking-tight">
            <Link href={`/setlists/${setlist.id}`} className="rounded-sm underline decoration-transparent underline-offset-4 hover:decoration-action-primary focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
              {setlist.name}
            </Link>
          </h3>
          {setlist.isCreator ? <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Owner</span> : null}
        </div>
        <p className="mt-2 text-sm text-text-muted">
          {pluralise(setlist.tuneCount, "tune")} · {pluralise(setlist.memberCount, "musician")}
          {setlist.event_date ? ` · ${setlist.event_date}` : ""}
          {setlist.location ? ` · ${setlist.location}` : ""}
        </p>
        {setlist.collaboratorLabels.length > 0 ? (
          <p className="mt-1 truncate text-sm text-text-muted">With {setlist.collaboratorLabels.join(", ")}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" aria-label="Your private readiness">
        <span><strong>{setlist.readyCount}</strong> Known</span>
        <span><strong>{setlist.practiceCount}</strong> in Practice</span>
        <span><strong>{setlist.newToMeCount}</strong> new to you</span>
        <Link href={`/setlists/${setlist.id}`} className="inline-flex min-h-11 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-control border border-hairline px-4 font-semibold">Open</Link>
      </div>
    </article>
  )
}

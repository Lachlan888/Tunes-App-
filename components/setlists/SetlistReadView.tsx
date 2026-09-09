import Link from "next/link"
import TuneRow from "@/components/tunes/TuneRow"
import TuneStateIndicator from "@/components/tunes/TuneStateIndicator"
import type { SetlistItemWithCoverage } from "@/lib/types"

export default function SetlistReadView({
  currentUserId,
  items,
}: {
  currentUserId: string
  items: SetlistItemWithCoverage[]
}) {
  if (items.length === 0) {
    return <p className="border-y border-hairline py-5 text-sm text-text-muted">This setlist has no tunes yet. Open Manage to add the first tune.</p>
  }

  return (
    <section aria-labelledby="running-order-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">RUNNING ORDER</p>
          <h2 id="running-order-title" className="mt-1 text-xl font-semibold">Tunes in playing order</h2>
        </div>
        <Link href={`?mode=performance&performance=${items[0].id}`} className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">Performance Mode</Link>
      </div>
      <ol className="mt-4 divide-y divide-hairline border-y border-hairline">
        {items.map((item, index) => {
          const ownState = item.coverage.find((row) => row.user_id === currentUserId)
          if (!item.piece) return null
          const key = item.performance_key ?? item.piece.key
          const type = item.piece.type ?? item.piece.style
          return (
            <li key={item.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
              <span className="pt-5 text-lg font-bold tabular-nums text-text-muted">{index + 1}</span>
              <TuneRow
                piece={item.piece}
                personalState={<TuneStateIndicator isKnown={ownState?.status === "known"} isAlreadyInPractice={ownState?.status === "practice"} stage={ownState?.stage} showNewToMe={!ownState || ownState.status === "gap"} />}
                supportingContent={<span>{[key ? `Key ${key}` : "Key not set", type, item.notes ? item.notes.slice(0, 120) : null].filter(Boolean).join(" · ")}</span>}
              />
            </li>
          )
        })}
      </ol>
    </section>
  )
}

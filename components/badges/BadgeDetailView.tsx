import Link from "next/link"
import BadgeArtwork from "./BadgeArtwork"
import BadgeAwardMoment from "./BadgeAwardMoment"
import BadgeProgressSummary from "./BadgeProgressSummary"
import BadgeRecipientsList from "./BadgeRecipientsList"
import { badgeFamilies, badgeNextAction } from "@/lib/badges/identity"
import type { BadgeDetailData } from "@/lib/types"

export default function BadgeDetailView({ data }: { data: Extract<BadgeDetailData, { status: "loaded" }> }) {
  const { badge } = data
  const owner = badge.owner_profile
  const ownerName = owner?.display_name || owner?.username || "a fellow player"
  const family = badgeFamilies[badge.category]
  const next = data.viewerId ? badgeNextAction(badge) : { label: "Sign in to see your progress", href: `/login?next=${encodeURIComponent(`/badges/${badge.slug}`)}` }
  const awarding = badge.awarding_mode === "auto_when_eligible" ? "Automatically when eligible" : badge.awarding_mode === "requestable" ? "By the creator, following a request" : "By the creator"
  return <>
    <BadgeAwardMoment badges={[badge]} viewerId={data.viewerId} />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section>
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <BadgeArtwork category={badge.category} earned={Boolean(badge.viewer_award)} className="h-24 w-24 shrink-0 md:h-36 md:w-36" />
          <div className="min-w-0"><p className="text-sm font-semibold text-state-social">{family.label}</p><h1 className="mt-1 break-words font-serif text-3xl font-bold md:text-5xl">{badge.name}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Awarded by {owner?.username ? <Link href={`/users/${encodeURIComponent(owner.username)}`} className="underline">{ownerName}</Link> : ownerName}</p>
          </div>
        </div>
        <p className="my-5 whitespace-pre-line text-base leading-7">{badge.description || badge.commentary || "A little recognition for your musical life."}</p>
        {badge.commentary && badge.commentary !== badge.description ? <p className="mb-5 whitespace-pre-line text-sm italic">{badge.commentary}</p> : null}
        <section className="border-t border-border py-4"><h2 className="font-semibold">What it recognises</h2><p className="mt-2 text-sm leading-6">{badge.condition_summary || "Recognition chosen by the badge creator."}</p></section>
        <details className="border-t border-border py-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold">Recipients · {badge.recipient_count}</summary><BadgeRecipientsList awards={data.awards} /></details>
      </section>
      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <section className="rounded-object border border-border bg-surface-paper p-4"><h2 className="mb-3 font-semibold">Your badge</h2><BadgeProgressSummary viewerAward={badge.viewer_award} progress={badge.viewer_progress} /><Link href={next.href} className="badge-primary-action mt-4 inline-flex min-h-11 items-center rounded-control bg-state-social px-4 text-sm font-semibold text-state-social-foreground">{next.label}</Link></section>
        <dl className="space-y-3 text-sm"><div><dt className="text-muted-foreground">Awarding</dt><dd>{awarding}</dd></div><div><dt className="text-muted-foreground">Visibility</dt><dd>{badge.visibility === "public" ? "Public" : badge.visibility === "unlisted" ? "Unlisted · available by direct link" : "Private · visible only to the creator"}</dd></div></dl>
      </aside>
    </div>
  </>
}

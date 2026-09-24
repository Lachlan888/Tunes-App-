import Link from 'next/link'
import BadgeArtwork from './BadgeArtwork'
import BadgeProgressSummary from './BadgeProgressSummary'
import { badgeFamilies } from '@/lib/badges/identity'
import type { BadgeWithOwner } from '@/lib/types'

export default function BadgeCard({badge}: {badge:BadgeWithOwner}) {
  const href = `/badges/${encodeURIComponent(badge.slug)}`
  const family = badgeFamilies[badge.category] ?? badgeFamilies.social
  const ownerName = badge.owner_profile?.display_name || badge.owner_profile?.username || 'a fellow player'
  return <article className="rounded-object border border-border bg-surface-paper p-4">
    <div className="flex items-start gap-3"><BadgeArtwork category={badge.category} earned={Boolean(badge.viewer_award)} className="h-20 w-20 shrink-0" /><div className="min-w-0"><p className="text-xs font-semibold text-state-social">{family.label} · {badge.category}</p><h2 className="mt-1 break-words text-xl font-bold"><Link href={href} className="underline-offset-4 hover:underline">{badge.name}</Link></h2><p className="mt-1 text-sm text-muted-foreground">Awarded by {badge.owner_profile?.username ? <Link href={`/users/${encodeURIComponent(badge.owner_profile.username)}`} className="underline">{ownerName}</Link> : ownerName}</p></div></div>
    <p className="my-3 text-sm leading-6">{badge.description || badge.condition_summary || 'A little recognition for your musical life.'}</p>
    <BadgeProgressSummary viewerAward={badge.viewer_award} progress={badge.viewer_progress} />
    <div className="mt-3 flex items-center justify-between gap-2 text-sm"><span className="text-muted-foreground">{badge.recipient_count} recipient{badge.recipient_count === 1 ? '' : 's'}{badge.visibility !== 'public' ? ` · ${badge.visibility}` : ''}</span><Link href={href} className="inline-flex min-h-11 items-center font-semibold text-state-social underline">Meaning & next step<span className="sr-only"> for {badge.name}</span></Link></div>
  </article>
}

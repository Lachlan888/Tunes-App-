'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BadgeArtwork from './BadgeArtwork'
import { awardAnnouncementKey, isRecentAward } from '@/lib/badges/identity'
import type { BadgeWithOwner } from '@/lib/types'

const announcedThisSession = new Set<string>()

export default function BadgeAwardMoment({badges, viewerId}: {badges:BadgeWithOwner[];viewerId:string | null}) {
  const [moment, setMoment] = useState<BadgeWithOwner | null>(null)
  useEffect(() => {
    if (!viewerId) return
    // Defer beyond the Strict Mode effect replay; claim before displaying.
    const timer = window.setTimeout(() => {
      const fresh = badges.filter(badge => {
        const award = badge.viewer_award
        if (!award || award.recipient_user_id !== viewerId || !isRecentAward(award.awarded_at, Date.now())) return false
        const key = awardAnnouncementKey(viewerId, award.id)
        if (announcedThisSession.has(key)) return false
        try { if (localStorage.getItem(key)) return false } catch { /* In-memory fallback when storage is unavailable. */ }
        return true
      })
      // One quiet moment per batch; avoid replaying a backlog across route changes.
      for (const badge of fresh) {
        const key = awardAnnouncementKey(viewerId, badge.viewer_award!.id)
        announcedThisSession.add(key)
        try { localStorage.setItem(key, 'seen') } catch { /* Session fallback above. */ }
      }
      if (fresh.length) setMoment(fresh[0])
    }, 0)
    return () => window.clearTimeout(timer)
  }, [badges, viewerId])
  useEffect(() => {
    if (!moment) return
    const timer = window.setTimeout(() => setMoment(null), 8000)
    return () => window.clearTimeout(timer)
  }, [moment])
  return <div aria-live="polite" aria-atomic="true">{moment && moment.viewer_award?.recipient_user_id === viewerId ? <section className="badge-award-moment my-4 flex items-center gap-3 rounded-object border border-state-social bg-surface-paper p-3">
    <BadgeArtwork category={moment.category} earned className="h-14 w-14 shrink-0" />
    <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-state-social">A little recognition</p><Link href={`/badges/${encodeURIComponent(moment.slug)}`} className="font-semibold underline underline-offset-4">{moment.name}</Link><p className="text-sm text-muted-foreground">Awarded by {moment.owner_profile?.display_name || moment.owner_profile?.username || 'a fellow player'}.</p></div>
    <button type="button" onClick={() => setMoment(null)} className="min-h-11 px-3 text-sm underline" aria-label="Dismiss badge award">Dismiss</button>
  </section> : null}</div>
}

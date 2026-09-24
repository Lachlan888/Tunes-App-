import type { BadgeCategory, BadgeWithOwner } from '../types/badges.ts'

// Shared carved silhouettes and stitch borders; colour never encodes review quality.
export const badgeFamilies = {
  repertoire: { label: 'Tunebook', motif: 'book', shape: 'shield', ink: 'plum' },
  practice: { label: 'The daily craft', motif: 'note', shape: 'round', ink: 'ink' },
  lore: { label: 'Story keepers', motif: 'leaf', shape: 'arch', ink: 'timber' },
  media: { label: 'Sound collectors', motif: 'waves', shape: 'round', ink: 'ink' },
  catalogue: { label: 'Field notes', motif: 'book', shape: 'arch', ink: 'timber' },
  social: { label: 'Session company', motif: 'people', shape: 'scallop', ink: 'plum' },
  recovery: { label: 'Returning players', motif: 'leaf', shape: 'shield', ink: 'ink' },
  collaboration: { label: 'Together in tune', motif: 'people', shape: 'scallop', ink: 'plum' },
} as const satisfies Record<BadgeCategory, {label:string;motif:string;shape:string;ink:string}>

export function badgeNextAction(badge: Pick<BadgeWithOwner, 'viewer_award' | 'viewer_progress' | 'awarding_mode' | 'condition_logic'>) {
  if (badge.viewer_award) return { label: 'Keep making music', href: '/review' }
  if (badge.awarding_mode !== 'auto_when_eligible') return {label: 'Explore the community', href: '/friends'}
  const type = badge.condition_logic.conditions?.[0]?.type
  if (!type) return {label: 'Explore the community', href: '/friends'}
  return type?.startsWith('know_') || type === 'known_tune_count'
    ? {label: 'Explore your tunes', href: '/library/known'}
    : {label: 'Contribute to a tune', href: '/library'}
}

export function awardAnnouncementKey(userId: string, awardId: number) {
  return `tunes:badge-award:v1:${userId}:${awardId}`
}

export function isRecentAward(awardedAt: string, now: number) {
  const age = now - Date.parse(awardedAt)
  return Number.isFinite(age) && age >= 0 && age < 24 * 60 * 60 * 1000
}

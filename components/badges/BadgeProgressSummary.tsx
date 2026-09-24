import type { BadgeAward, BadgeProgressSummary as BadgeProgress } from '@/lib/types'

export default function BadgeProgressSummary({viewerAward, progress}: {viewerAward:BadgeAward | null;progress:BadgeProgress | null}) {
  if (viewerAward) return <div className="border-t border-border pt-3"><p className="font-semibold text-state-social">✓ Earned</p><p className="text-sm text-muted-foreground">Awarded {new Intl.DateTimeFormat('en-AU', {day:'numeric',month:'short',year:'numeric',timeZone:'Australia/Melbourne'}).format(new Date(viewerAward.awarded_at))}</p></div>
  if (!progress) return <p className="text-sm text-muted-foreground">Sign in to see your badge status.</p>
  if (!progress.isCalculable || progress.required <= 0) return <div className="border-t border-border pt-3"><p className="font-semibold">Not yet earned</p><p className="text-sm text-muted-foreground">This recognition has no measurable progress. Read its meaning and awarding details.</p></div>
  const current = Math.max(0, progress.current)
  return <div className="border-t border-border pt-3"><div className="flex items-baseline justify-between gap-2"><p className="font-semibold">{progress.isEligible ? 'Criteria met · awaiting award' : current > 0 ? 'In progress' : 'Not yet earned'}</p><span className="text-sm">{current} / {progress.required}</span></div><progress aria-label="Badge progress" max={progress.required} value={Math.min(current,progress.required)} className="badge-progress mt-2 h-2 w-full" /><p className="mt-1 text-sm text-muted-foreground">{progress.label}</p></div>
}

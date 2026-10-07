export default function PersonalReadinessStrip({
  ready,
  practice,
  newToMe,
}: {
  ready: number
  practice: number
  newToMe: number
}) {
  return (
    <section className="border-y border-hairline py-4" aria-labelledby="readiness-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="readiness-title" className="text-lg font-semibold">Your readiness</h2>
          <details className="mt-1 text-sm text-text-muted">
            <summary className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.5"><rect x="3" y="7" width="10" height="7" rx="1" /><path d="M5 7V5a3 3 0 0 1 6 0v2" /></svg>
              Private to you
            </summary>
            <p className="pb-2">This is a preparation guide, not a public score.</p>
          </details>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-hairline sm:min-w-[360px]">
          <div className="px-3 py-2"><dt className="text-xs text-text-muted">Known</dt><dd className="text-xl font-bold">{ready}</dd></div>
          <div className="px-3 py-2"><dt className="text-xs text-text-muted">In Practice</dt><dd className="text-xl font-bold">{practice}</dd></div>
          <div className="px-3 py-2"><dt className="text-xs text-text-muted">New to you</dt><dd className="text-xl font-bold">{newToMe}</dd></div>
        </dl>
      </div>
    </section>
  )
}

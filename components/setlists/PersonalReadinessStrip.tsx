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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">PRIVATE PREPARATION</p>
          <h2 id="readiness-title" className="mt-1 text-lg font-semibold">Your readiness</h2>
          <p className="mt-1 text-sm text-text-muted">Only you can see this. It is a preparation guide, not a public score.</p>
        </div>
        <dl className="grid grid-cols-3 divide-x divide-hairline border-y border-hairline sm:min-w-[360px]">
          <div className="px-3 py-2"><dt className="text-xs text-text-muted">Known</dt><dd className="text-xl font-bold">{ready}</dd></div>
          <div className="px-3 py-2"><dt className="text-xs text-text-muted">In Practice</dt><dd className="text-xl font-bold">{practice}</dd></div>
          <div className="px-3 py-2"><dt className="text-xs text-text-muted">New to you</dt><dd className="text-xl font-bold">{newToMe}</dd></div>
        </dl>
      </div>
    </section>
  )
}

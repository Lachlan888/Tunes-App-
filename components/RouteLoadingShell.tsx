type RouteLoadingShellProps = {
  label: string
  title: string
  description: string
  primarySectionTitle: string
  secondarySectionTitle?: string
  mode?: "single" | "split"
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-3 rounded-full bg-card-strong ${className}`}
      aria-hidden="true"
    />
  )
}

function SkeletonButton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-10 rounded-full border border-border bg-background/70 ${className}`}
      aria-hidden="true"
    />
  )
}

function SkeletonCard() {
  return (
    <article className="rounded-2xl border border-border bg-background/70 p-4 shadow-sm">
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="mt-3 w-1/2" />
      <SkeletonLine className="mt-2 w-3/4" />

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="h-7 w-20 rounded-full border border-border bg-muted" />
        <div className="h-7 w-24 rounded-full border border-border bg-muted" />
        <div className="h-7 w-16 rounded-full border border-border bg-muted" />
      </div>
    </article>
  )
}

function SkeletonFilterPanel() {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <SkeletonLine className="h-4 w-40" />

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="h-11 rounded-2xl border border-border bg-background/70" />
        <div className="h-11 rounded-2xl border border-border bg-background/70" />
        <div className="h-11 rounded-2xl border border-border bg-background/70" />
        <div className="h-11 rounded-2xl border border-border bg-background/70" />
      </div>
    </section>
  )
}

function SkeletonResultsSection({ title }: { title: string }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>

        <div className="flex gap-2">
          <SkeletonButton className="w-20" />
          <SkeletonButton className="w-24" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </section>
  )
}

function SkeletonSidePanel({ title }: { title: string }) {
  return (
    <aside className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>

      <div className="mt-5 space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </aside>
  )
}

export default function RouteLoadingShell({
  label,
  title,
  description,
  primarySectionTitle,
  secondarySectionTitle = "Summary",
  mode = "single",
}: RouteLoadingShellProps) {
  return (
    <main
      className="mx-auto max-w-[1500px] px-6 py-8 text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <SkeletonButton className="w-28" />
          <SkeletonButton className="w-32" />
          <SkeletonButton className="w-24" />
        </div>
      </section>

      <div className="animate-pulse space-y-6">
        {mode === "single" ? (
          <>
            <SkeletonFilterPanel />
            <SkeletonResultsSection title={primarySectionTitle} />
          </>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)]">
            <div className="space-y-6">
              <SkeletonFilterPanel />
              <SkeletonResultsSection title={primarySectionTitle} />
            </div>

            <SkeletonSidePanel title={secondarySectionTitle} />
          </div>
        )}
      </div>
    </main>
  )
}
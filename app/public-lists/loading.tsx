import RouteLoadingShell from "@/components/RouteLoadingShell"

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-3 rounded-full bg-card-strong ${className}`}
      aria-hidden="true"
    />
  )
}

function MobilePublicListSkeleton() {
  return (
    <main
      className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <section className="mb-5 border-b border-border/70 pb-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Public Lists
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Loading public lists...
        </p>
      </section>

      <section className="animate-pulse">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Public lists
        </h2>

        <div className="mt-2 divide-y divide-border/70 border-y border-border/70">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0 flex-1">
                <SkeletonLine className="h-4 w-3/4" />
                <SkeletonLine className="mt-3 w-2/3" />
              </div>
              <div
                className="h-10 w-20 shrink-0 rounded-full border border-border bg-background/70"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default function PublicListsLoading() {
  return (
    <>
      <MobilePublicListSkeleton />

      <div className="hidden md:block">
        <RouteLoadingShell
          label="Shared"
          title="Loading public lists"
          description="Finding public tune lists from other users."
          primarySectionTitle="Public lists"
        />
      </div>
    </>
  )
}

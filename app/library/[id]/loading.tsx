import { LoadingState, Skeleton } from "@/components/ui/Skeleton"

export default function TuneDetailLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading tune detail"
      className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-8"
    >
      <span className="sr-only" role="status" aria-live="polite">
        Loading tune detail
      </span>
      <Skeleton className="h-11 w-28" />
      <section className="mt-3 rounded-sheet bg-surface-paper p-5 shadow-material-raised sm:p-6">
        <Skeleton className="h-10 w-3/5" />
        <Skeleton className="mt-3 h-4 w-2/5" />
        <Skeleton className="mt-3 h-7 w-36 rounded-pill" />
      </section>
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-control bg-surface-note p-1">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <LoadingState label="Loading selected tune view" rows={4} className="mt-5" />
    </main>
  )
}

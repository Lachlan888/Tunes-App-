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
      <section className="mt-3 border-b border-hairline py-6">
        <Skeleton className="h-10 w-3/5" />
        <Skeleton className="mt-3 h-4 w-2/5" />
        <Skeleton className="mt-3 h-7 w-36" />
      </section>
      <div className="mt-4 grid grid-cols-3 border-b border-hairline">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
      <LoadingState label="Loading selected tune view" rows={4} className="mt-5" />
    </main>
  )
}

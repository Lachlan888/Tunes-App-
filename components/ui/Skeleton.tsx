import { joinClasses } from "@/components/ui/buttonStyles"

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={joinClasses(
        "block animate-pulse rounded-control bg-surface-note motion-reduce:animate-none",
        className
      )}
    />
  )
}

type LoadingStateProps = {
  label?: string
  rows?: number
  className?: string
}

export function LoadingState({
  label = "Loading content",
  rows = 3,
  className,
}: LoadingStateProps) {
  return (
    <section
      aria-busy="true"
      aria-label={label}
      className={joinClasses(
        "rounded-object bg-surface-paper p-5 shadow-material-rest",
        className
      )}
    >
      <span className="sr-only" role="status" aria-live="polite">
        {label}
      </span>
      <Skeleton className="h-5 w-2/5" />
      <div className="mt-5 divide-y divide-hairline">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="py-4 first:pt-0 last:pb-0">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  )
}

export default Skeleton

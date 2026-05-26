import { joinClasses } from "@/components/ui/buttonStyles"

type LoadingSpinnerProps = {
  label?: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  centered?: boolean
  decorative?: boolean
  className?: string
  labelClassName?: string
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
} as const

export default function LoadingSpinner({
  label = "Loading...",
  showLabel = false,
  size = "md",
  centered = false,
  decorative = false,
  className,
  labelClassName,
}: LoadingSpinnerProps) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className={joinClasses(
          "shrink-0 rounded-full border-border border-t-primary motion-safe:animate-spin motion-reduce:border-primary",
          sizeClasses[size]
        )}
      />

      {showLabel ? (
        <span
          className={joinClasses(
            "text-sm font-medium text-muted-foreground",
            labelClassName
          )}
        >
          {label}
        </span>
      ) : decorative ? null : (
        <span className="sr-only">{label}</span>
      )}
    </>
  )

  return (
    <span
      role={decorative ? undefined : "status"}
      aria-live={decorative ? undefined : "polite"}
      className={joinClasses(
        "inline-flex items-center gap-2",
        centered && "flex w-full justify-center py-6",
        className
      )}
    >
      {content}
    </span>
  )
}

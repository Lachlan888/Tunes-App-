import type { ReactNode } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type MobileTuneRowProps = {
  title: string
  tuneKey?: string | null
  style?: string | null
  timeSignature?: string | null
  stage?: number | string | null
  status?: string | null
  note?: string | null
  action?: ReactNode
  href?: string
  className?: string
}

function buildMetadata({
  tuneKey,
  style,
  timeSignature,
}: {
  tuneKey?: string | null
  style?: string | null
  timeSignature?: string | null
}) {
  return [tuneKey ? `Key: ${tuneKey}` : null, style, timeSignature]
    .filter(Boolean)
    .join(" · ")
}

export default function MobileTuneRow({
  title,
  tuneKey,
  style,
  timeSignature,
  stage,
  status,
  note,
  action,
  href,
  className,
}: MobileTuneRowProps) {
  const metadata = buildMetadata({ tuneKey, style, timeSignature })

  const content = (
    <div
      className={joinClasses(
        "rounded-2xl border border-border bg-background/70 p-4 shadow-sm md:hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight text-foreground">
            {title}
          </p>

          {metadata ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {metadata}
            </p>
          ) : null}

          {stage || status ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {stage ? (
                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Stage {stage}
                </span>
              ) : null}

              {status ? (
                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {status}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {note ? (
        <p className="mt-3 line-clamp-3 rounded-xl border border-border bg-card p-3 text-sm leading-6 text-foreground">
          {note}
        </p>
      ) : null}
    </div>
  )

  if (!href) return content

  return (
    <a
      href={href}
      className="block rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:hidden"
    >
      {content}
    </a>
  )
}
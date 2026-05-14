import type { ReactNode } from "react"

type MobilePageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  meta?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  children?: ReactNode
}

export default function MobilePageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  primaryAction,
  secondaryAction,
  children,
}: MobilePageHeaderProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:hidden">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground">
          {title}
        </h1>

        {subtitle ? (
          <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
        ) : null}

        {meta ? <div className="text-sm text-muted-foreground">{meta}</div> : null}
      </div>

      {primaryAction || secondaryAction ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  )
}
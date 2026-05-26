import type { ReactNode } from "react"

type MobilePageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  meta?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  children?: ReactNode
  variant?: "card" | "plain"
}

export default function MobilePageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
  primaryAction,
  secondaryAction,
  children,
  variant = "card",
}: MobilePageHeaderProps) {
  const sectionClassName =
    variant === "plain"
      ? "border-b border-border/70 pb-4 md:hidden"
      : "rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden"

  return (
    <section className={sectionClassName}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground">
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

"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"

type MobileDisclosureSectionProps = {
  title: string
  description?: string
  defaultOpen?: boolean
  openLabel?: string
  closeLabel?: string
  summary?: ReactNode
  children: ReactNode
  className?: string
}

export default function MobileDisclosureSection({
  title,
  description,
  defaultOpen = false,
  openLabel = "Show",
  closeLabel = "Hide",
  summary,
  children,
  className,
}: MobileDisclosureSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section
      className={joinClasses(
        "rounded-2xl border border-border bg-card p-4 shadow-sm md:hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {title}
          </h3>

          {description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          className={buttonStyles.secondary}
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          {isOpen ? closeLabel : openLabel}
        </button>
      </div>

      {!isOpen && summary ? <div className="mt-4">{summary}</div> : null}

      {isOpen ? <div className="mt-4">{children}</div> : null}
    </section>
  )
}
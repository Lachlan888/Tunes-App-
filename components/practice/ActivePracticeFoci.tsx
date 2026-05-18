"use client"

import Link from "next/link"
import { useState } from "react"
import type { PracticeFocusForReview } from "@/lib/loaders/review"

type ActivePracticeFociProps = {
  foci: PracticeFocusForReview[]
}

export default function ActivePracticeFoci({
  foci,
}: ActivePracticeFociProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (foci.length === 0) {
    return null
  }

  return (
    <section className="mt-5 border-t border-border pt-4">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 text-left md:hidden"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Active foci
          </span>

          <span className="mt-1 block text-sm text-muted-foreground">
            {foci.length} focus {foci.length === 1 ? "cue" : "cues"} for this
            tune
          </span>
        </span>

        <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          {isOpen ? "Hide" : "Show"}
        </span>
      </button>

      <div className="hidden md:block">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Active foci
        </p>

        <ul className="mt-2 flex flex-wrap gap-2">
          {foci.map((focus) => (
            <li key={focus.id}>
              <Link
                href={`/review/foci/${focus.id}`}
                className="inline-flex rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:bg-card hover:text-foreground"
                title={focus.description ?? undefined}
              >
                {focus.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isOpen ? (
        <ul className="mt-4 divide-y divide-border md:hidden">
          {foci.map((focus) => (
            <li key={focus.id} className="py-3 first:pt-0 last:pb-0">
              <Link
                href={`/review/foci/${focus.id}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {focus.title}
              </Link>

              {focus.description ? (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {focus.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { buildCompareHref } from "@/lib/compare-page"

type CompareScopeToggleProps = {
  includePractice: boolean
  filterPreservedUsers: string[]
  titleQuery: string
  selectedKeys: string[]
  selectedStyles: string[]
  selectedTimeSignatures: string[]
}

export default function CompareScopeToggle({
  includePractice,
  filterPreservedUsers,
  titleQuery,
  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
}: CompareScopeToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const nextHref = buildCompareHref(filterPreservedUsers, {
    q: titleQuery,
    key: selectedKeys,
    style: selectedStyles,
    time_signature: selectedTimeSignatures,
    includePractice: !includePractice,
  })

  function handleToggle() {
    startTransition(() => {
      router.push(nextHref)
      router.refresh()
    })
  }

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={includePractice}
          disabled={isPending}
          onChange={handleToggle}
          className="mt-1 h-4 w-4 rounded border-border accent-primary disabled:cursor-not-allowed"
        />

        <span>
          <span className="block text-sm font-semibold text-foreground">
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <LoadingSpinner
                  label="Updating compare scope..."
                  size="sm"
                  decorative
                />
                <span>Updating compare scope...</span>
              </span>
            ) : (
              "Include practice tunes"
            )}
          </span>

          <span className="mt-1 block text-sm text-muted-foreground">
            Known tunes are always compared. Turn this on to also include tunes
            each player has in active practice.
          </span>
        </span>
      </label>
    </div>
  )
}

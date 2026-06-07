"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { buildCompareHref } from "@/lib/compare-page"

type CompareSearchFormProps = {
  initialQuery?: string
  selectedUsers?: string[]
  includePractice?: boolean
}

export default function CompareSearchForm({
  initialQuery = "",
  selectedUsers = [],
  includePractice = false,
}: CompareSearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()
    const existingUsers = selectedUsers.filter(Boolean)

    startTransition(() => {
      const nextHref = buildCompareHref(existingUsers, {
        includePractice,
        userSearch: trimmedQuery,
      })

      router.push(nextHref)
      router.refresh()
      setQuery("")
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-sm"
    >
      <label
        htmlFor="user"
        className="block text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground"
      >
        Add player to compare
      </label>

      <div className="mt-4 flex gap-3">
        <input
          id="user"
          name="user"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
          placeholder="Search by username or display name"
        />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <LoadingSpinner label="Adding..." size="sm" decorative />
              <span>Adding...</span>
            </span>
          ) : (
            "Add"
          )}
        </button>
      </div>
    </form>
  )
}

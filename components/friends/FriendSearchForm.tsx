"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type FriendSearchFormProps = {
  initialQuery: string
}

export default function FriendSearchForm({
  initialQuery,
}: FriendSearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    startTransition(() => {
      if (trimmedQuery) {
        router.push(`/friends?q=${encodeURIComponent(trimmedQuery)}`)
      } else {
        router.push("/friends")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
      <input
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or username"
        className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        aria-busy={isPending}
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  )
}
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type CompareSearchFormProps = {
  initialQuery?: string
  selectedUsers?: string[]
}

export default function CompareSearchForm({
  initialQuery = "",
  selectedUsers = [],
}: CompareSearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    startTransition(() => {
      if (!trimmedQuery) {
        router.push("/compare")
        return
      }

      const existingUsers = selectedUsers.filter(Boolean)
      const alreadySelected = existingUsers.some(
        (user) => user.toLowerCase() === trimmedQuery.toLowerCase()
      )

      const nextUsers = alreadySelected
        ? existingUsers
        : [...existingUsers, trimmedQuery]

      const params = new URLSearchParams()

      nextUsers.forEach((user) => {
        params.append("user", user)
      })

      router.push(`/compare?${params.toString()}`)
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
        Add user to compare
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
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  )
}
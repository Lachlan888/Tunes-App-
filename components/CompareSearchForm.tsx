"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type CompareSearchFormProps = {
  initialQuery: string
}

export default function CompareSearchForm({
  initialQuery,
}: CompareSearchFormProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    startTransition(() => {
      if (trimmedQuery) {
        router.push(`/compare?user=${encodeURIComponent(trimmedQuery)}`)
      } else {
        router.push("/compare")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded border p-4">
      <label htmlFor="user" className="mb-2 block text-sm font-medium">
        Username or display name
      </label>

      <div className="flex gap-3">
        <input
          id="user"
          name="user"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded border p-2"
          placeholder="Search by username or display name"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  )
}
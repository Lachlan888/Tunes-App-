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
    <form onSubmit={handleSubmit} className="mb-4 flex gap-3">
      <input
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or username"
        className="w-full rounded border p-2"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Searching..." : "Search"}
      </button>
    </form>
  )
}
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
    <form onSubmit={handleSubmit} className="mb-8 rounded border p-4">
      <label htmlFor="user" className="mb-2 block text-sm font-medium">
        Add user to compare
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
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  )
}
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

type LearningListRow = {
  id: number
  user_id: string
  name: string
  description: string | null
}

type ProfileRow = {
  id: string
  username: string | null
}

type SharedList = {
  id: number
  name: string
  description: string | null
  ownerUsername: string | null
}

export default async function PublicListsPage() {
  const supabase = await createClient()

  const { data: learningLists, error: listsError } = await supabase
    .from("learning_lists")
    .select("id, user_id, name, description")
    .eq("visibility", "public")
    .order("id", { ascending: false })

  if (listsError) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Shared</h1>
        <p>Could not load shared lists.</p>
        <p className="mt-2 text-sm text-red-600">{listsError.message}</p>
      </main>
    )
  }

  const lists = (learningLists ?? []) as LearningListRow[]

  const ownerIds = [...new Set(lists.map((list) => list.user_id))]

  let profilesById: Record<string, string | null> = {}

  if (ownerIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", ownerIds)

    if (profilesError) {
      return (
        <main className="mx-auto max-w-4xl p-6">
          <h1 className="mb-4 text-2xl font-bold">Shared</h1>
          <p>Could not load shared lists.</p>
          <p className="mt-2 text-sm text-red-600">{profilesError.message}</p>
        </main>
      )
    }

    profilesById = ((profiles ?? []) as ProfileRow[]).reduce(
      (acc, profile) => {
        acc[profile.id] = profile.username
        return acc
      },
      {} as Record<string, string | null>
    )
  }

  const sharedLists: SharedList[] = lists.map((list) => ({
    id: list.id,
    name: list.name,
    description: list.description,
    ownerUsername: profilesById[list.user_id] ?? null,
  }))

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Shared</h1>
      <p className="mb-6 text-sm text-gray-600">
        Browse shared tune lists from other users.
      </p>

      {sharedLists.length === 0 ? (
        <p>No shared lists yet.</p>
      ) : (
        <div className="space-y-4">
          {sharedLists.map((list) => (
            <div
              key={list.id}
              className="rounded-lg border bg-white p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold">{list.name}</h2>

              <p className="mt-1 text-sm text-gray-600">
                By {list.ownerUsername ?? "Unknown user"}
              </p>

              {list.description && (
                <p className="mt-3 text-sm">{list.description}</p>
              )}

              <div className="mt-4">
                <Link
                  href={`/public-lists/${list.id}`}
                  className="text-sm underline"
                >
                  View list
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
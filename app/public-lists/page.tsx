import PendingLinkButton from "@/components/PendingLinkButton"
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
  display_name: string | null
}

type LearningListItemCountRow = {
  learning_list_id: number
}

type SharedList = {
  id: number
  userId: string
  name: string
  description: string | null
  ownerUsername: string | null
  ownerDisplayName: string | null
  tuneCount: number
}

function formatOwnerLabel(list: SharedList) {
  if (list.ownerDisplayName && list.ownerUsername) {
    return `${list.ownerDisplayName} (@${list.ownerUsername})`
  }

  if (list.ownerDisplayName) {
    return list.ownerDisplayName
  }

  if (list.ownerUsername) {
    return `@${list.ownerUsername}`
  }

  return "Unknown user"
}

export default async function PublicListsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: learningLists, error: listsError } = await supabase
    .from("learning_lists")
    .select("id, user_id, name, description")
    .eq("visibility", "public")
    .order("id", { ascending: false })

  if (listsError) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Shared</h1>
        <p>Could not load shared lists.</p>
        <p className="mt-2 text-sm text-red-600">{listsError.message}</p>
      </main>
    )
  }

  const lists = (learningLists ?? []) as LearningListRow[]
  const ownerIds = [...new Set(lists.map((list) => list.user_id))]
  const listIds = lists.map((list) => list.id)

  let profilesById: Record<
    string,
    { username: string | null; displayName: string | null }
  > = {}

  if (ownerIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", ownerIds)

    if (profilesError) {
      return (
        <main className="mx-auto max-w-5xl p-6">
          <h1 className="mb-4 text-2xl font-bold">Shared</h1>
          <p>Could not load shared lists.</p>
          <p className="mt-2 text-sm text-red-600">{profilesError.message}</p>
        </main>
      )
    }

    profilesById = ((profiles ?? []) as ProfileRow[]).reduce(
      (acc, profile) => {
        acc[profile.id] = {
          username: profile.username,
          displayName: profile.display_name,
        }
        return acc
      },
      {} as Record<string, { username: string | null; displayName: string | null }>
    )
  }

  let countsByListId: Record<number, number> = {}

  if (listIds.length > 0) {
    const { data: itemRows, error: itemRowsError } = await supabase
      .from("learning_list_items")
      .select("learning_list_id")
      .in("learning_list_id", listIds)

    if (itemRowsError) {
      return (
        <main className="mx-auto max-w-5xl p-6">
          <h1 className="mb-4 text-2xl font-bold">Shared</h1>
          <p>Could not load shared lists.</p>
          <p className="mt-2 text-sm text-red-600">{itemRowsError.message}</p>
        </main>
      )
    }

    countsByListId = ((itemRows ?? []) as LearningListItemCountRow[]).reduce(
      (acc, row) => {
        acc[row.learning_list_id] = (acc[row.learning_list_id] ?? 0) + 1
        return acc
      },
      {} as Record<number, number>
    )
  }

  const sharedLists: SharedList[] = lists.map((list) => ({
    id: list.id,
    userId: list.user_id,
    name: list.name,
    description: list.description,
    ownerUsername: profilesById[list.user_id]?.username ?? null,
    ownerDisplayName: profilesById[list.user_id]?.displayName ?? null,
    tuneCount: countsByListId[list.id] ?? 0,
  }))

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Shared</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-600">
        Browse public tune lists from other users, see who made them, and open a
        list to import the whole thing or just the tunes you want into your own
        private lists.
      </p>

      {sharedLists.length === 0 ? (
        <p>No shared lists yet.</p>
      ) : (
        <div className="space-y-4">
          {sharedLists.map((list) => {
            const isOwnedByCurrentUser = user?.id === list.userId

            return (
              <div
                key={list.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold">{list.name}</h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                      <span>By {formatOwnerLabel(list)}</span>
                      <span>{list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}</span>
                      {isOwnedByCurrentUser && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          Your public list
                        </span>
                      )}
                    </div>

                    {list.description ? (
                      <p className="mt-3 text-sm text-gray-800">
                        {list.description}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-gray-500">
                        No description yet.
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <PendingLinkButton
                      href={`/public-lists/${list.id}`}
                      label="Browse and import"
                      pendingLabel="Loading..."
                      className="inline-block rounded border px-3 py-2 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
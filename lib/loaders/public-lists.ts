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

export type SharedList = {
  id: number
  userId: string
  name: string
  description: string | null
  ownerUsername: string | null
  ownerDisplayName: string | null
  ownerLabel: string
  tuneCount: number
  isOwnedByCurrentUser: boolean
}

export type PublicListsLoadResult =
  | {
      status: "loaded"
      sharedLists: SharedList[]
    }
  | {
      status: "error"
      message: string
    }

function formatOwnerLabel(list: {
  ownerUsername: string | null
  ownerDisplayName: string | null
}) {
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

export async function loadPublicListsData(): Promise<PublicListsLoadResult> {
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
    return {
      status: "error",
      message: listsError.message,
    }
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
      return {
        status: "error",
        message: profilesError.message,
      }
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
      return {
        status: "error",
        message: itemRowsError.message,
      }
    }

    countsByListId = ((itemRows ?? []) as LearningListItemCountRow[]).reduce(
      (acc, row) => {
        acc[row.learning_list_id] = (acc[row.learning_list_id] ?? 0) + 1
        return acc
      },
      {} as Record<number, number>
    )
  }

  const sharedLists: SharedList[] = lists.map((list) => {
    const ownerUsername = profilesById[list.user_id]?.username ?? null
    const ownerDisplayName = profilesById[list.user_id]?.displayName ?? null

    return {
      id: list.id,
      userId: list.user_id,
      name: list.name,
      description: list.description,
      ownerUsername,
      ownerDisplayName,
      ownerLabel: formatOwnerLabel({
        ownerUsername,
        ownerDisplayName,
      }),
      tuneCount: countsByListId[list.id] ?? 0,
      isOwnedByCurrentUser: user?.id === list.user_id,
    }
  })

  return {
    status: "loaded",
    sharedLists,
  }
}
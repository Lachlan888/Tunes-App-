import { getStyleLabelsFromPiece } from "@/lib/search-filters"
import { createClient } from "@/lib/supabase/server"
import type {
  FilterableLearningList,
  LearningList,
  MyTuneRow,
  Piece,
  UserKnownPieceWithPiece,
  UserPieceWithPiece,
} from "@/lib/types"
import { redirect } from "next/navigation"

type LearningListItemWithPieceRow = {
  id: number
  learning_list_id: number
  created_at: string | null
  piece_id: number
  pieces: Piece | Piece[] | null
  learning_lists:
    | {
        id: number
        name: string
        user_id: string
      }
    | {
        id: number
        name: string
        user_id: string
      }[]
    | null
}

type LearningListBookmarkRow = {
  learning_list_id: number
  created_at: string | null
  learning_lists:
    | {
        id: number
        user_id: string
        name: string
        description: string | null
        visibility: string
      }
    | {
        id: number
        user_id: string
        name: string
        description: string | null
        visibility: string
      }[]
    | null
}

type DirectSharedListRow = {
  created_at: string | null
  learning_lists: LearningListBookmarkRow["learning_lists"]
}

type BookmarkOwnerProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

type BookmarkCountRow = {
  learning_list_id: number
}

function isMissingBookmarksTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    Boolean(error.message?.includes("learning_list_bookmarks"))
  )
}

function isMissingSharesTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    Boolean(error.message?.includes("learning_list_shares"))
  )
}

export type LearningQueueTune = {
  piece: Piece
  firstAddedAt: string | null
  firstAddedSortValue: string
  firstListId: number
  firstListName: string
  listIds: number[]
  listNames: string[]
}

export type BookmarkedSharedListSummary = {
  id: number
  name: string
  description: string | null
  ownerUserId: string
  ownerUsername: string | null
  ownerDisplayName: string | null
  ownerLabel: string
  tuneCount: number
  bookmarkedAt: string | null
}

export type DirectSharedListSummary = {
  id: number
  name: string
  description: string | null
  ownerUserId: string
  ownerUsername: string | null
  ownerDisplayName: string | null
  ownerLabel: string
  tuneCount: number
  sharedAt: string | null
}

function extractPieceTitle(
  piece:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
) {
  if (!piece) return null
  if (Array.isArray(piece)) {
    return piece[0]?.title ?? null
  }
  return piece.title
}

function extractPiece(piece: Piece | Piece[] | null): Piece | null {
  if (!piece) return null
  if (Array.isArray(piece)) {
    return piece[0] ?? null
  }
  return piece
}

function extractList(
  list:
    | {
        id: number
        name: string
        user_id: string
      }
    | {
        id: number
        name: string
        user_id: string
      }[]
    | null
) {
  if (!list) return null
  if (Array.isArray(list)) {
    return list[0] ?? null
  }
  return list
}

function extractBookmarkedList(
  list: LearningListBookmarkRow["learning_lists"]
) {
  if (!list) return null
  if (Array.isArray(list)) {
    return list[0] ?? null
  }
  return list
}

function extractDirectSharedList(list: DirectSharedListRow["learning_lists"]) {
  return extractBookmarkedList(list)
}

function formatBookmarkOwnerLabel(profile: {
  username: string | null
  displayName: string | null
}) {
  if (profile.displayName && profile.username) {
    return `${profile.displayName} (@${profile.username})`
  }

  if (profile.displayName) {
    return profile.displayName
  }

  if (profile.username) {
    return `@${profile.username}`
  }

  return "Unknown player"
}

function getQueueSortValue(item: LearningListItemWithPieceRow) {
  return item.created_at ?? `9999-12-31T23:59:59.999Z-${item.id}`
}

export async function loadListsData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [
    { data: learningLists, error: learningListsError },
    { data: userPieces, error: userPiecesError },
    { data: userKnownPieces, error: userKnownPiecesError },
    {
      data: learningListItemsWithPieces,
      error: learningListItemsWithPiecesError,
    },
    { data: bookmarkedSharedListRows, error: bookmarkedSharedListRowsError },
    { data: directSharedListRows, error: directSharedListRowsError },
  ] = await Promise.all([
    supabase
      .from("learning_lists")
      .select("id, name, description, visibility, is_imported")
      .eq("user_id", user.id)
      .order("id", { ascending: false }),

    supabase
      .from("user_pieces")
      .select(`
        id,
        piece_id,
        stage,
        pieces (
          id,
          title
        )
      `)
      .eq("user_id", user.id),

    supabase
      .from("user_known_pieces")
      .select(`
        id,
        piece_id,
        pieces (
          id,
          title
        )
      `)
      .eq("user_id", user.id),

    supabase
      .from("learning_list_items")
      .select(`
        id,
        learning_list_id,
        created_at,
        piece_id,
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          composer,
          reference_url,
          piece_styles (
            style_id,
            styles (
              id,
              slug,
              label
            )
          )
        ),
        learning_lists!inner(
          id,
          name,
          user_id
        )
      `)
      .eq("learning_lists.user_id", user.id)
      .order("created_at", { ascending: true })
      .order("position", { ascending: true }),

    supabase
      .from("learning_list_bookmarks")
      .select(
        `
        learning_list_id,
        created_at,
        learning_lists!inner(
          id,
          user_id,
          name,
          description,
          visibility
        )
      `
      )
      .eq("user_id", user.id)
      .eq("learning_lists.visibility", "public")
      .order("created_at", { ascending: false }),

    supabase
      .from("learning_list_shares")
      .select(
        `
        created_at,
        learning_lists!inner(
          id,
          user_id,
          name,
          description,
          visibility
        )
      `
      )
      .eq("shared_with_user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  if (learningListsError) {
    throw new Error(learningListsError.message)
  }

  if (userPiecesError) {
    throw new Error(userPiecesError.message)
  }

  if (userKnownPiecesError) {
    throw new Error(userKnownPiecesError.message)
  }

  if (learningListItemsWithPiecesError) {
    throw new Error(learningListItemsWithPiecesError.message)
  }

  if (
    bookmarkedSharedListRowsError &&
    !isMissingBookmarksTableError(bookmarkedSharedListRowsError)
  ) {
    throw new Error(bookmarkedSharedListRowsError.message)
  }

  if (
    directSharedListRowsError &&
    !isMissingSharesTableError(directSharedListRowsError)
  ) {
    throw new Error(directSharedListRowsError.message)
  }

  const typedLearningLists = (learningLists ?? []) as LearningList[]
  const typedUserPieces = (userPieces ?? []) as UserPieceWithPiece[]
  const typedUserKnownPieces = (userKnownPieces ??
    []) as UserKnownPieceWithPiece[]
  const typedLearningListItemsWithPieces = (learningListItemsWithPieces ??
    []) as LearningListItemWithPieceRow[]
  const typedBookmarkedSharedListRows = bookmarkedSharedListRowsError
    ? []
    : ((bookmarkedSharedListRows ?? []) as LearningListBookmarkRow[])
  const typedDirectSharedListRows = directSharedListRowsError
    ? []
    : ((directSharedListRows ?? []) as DirectSharedListRow[])

  const listedPieceIds = new Set(
    typedLearningListItemsWithPieces.map((item) => item.piece_id)
  )

  const practicePieceIds = new Set(
    typedUserPieces.map((userPiece) => userPiece.piece_id)
  )

  const knownPieceIds = new Set(
    typedUserKnownPieces.map((userKnownPiece) => userKnownPiece.piece_id)
  )

  const unlistedPracticeTunes = typedUserPieces.filter(
    (userPiece) => !listedPieceIds.has(userPiece.piece_id)
  )

  const unlistedKnownTunes = typedUserKnownPieces.filter(
    (userKnownPiece) => !listedPieceIds.has(userKnownPiece.piece_id)
  )

  const myTunesMap = new Map<number, MyTuneRow>()

  for (const userPiece of typedUserPieces) {
    const title = extractPieceTitle(userPiece.pieces)
    if (!title) continue

    const existing = myTunesMap.get(userPiece.piece_id)

    myTunesMap.set(userPiece.piece_id, {
      piece_id: userPiece.piece_id,
      title,
      inPractice: true,
      known: existing?.known ?? false,
    })
  }

  for (const userKnownPiece of typedUserKnownPieces) {
    const title = extractPieceTitle(userKnownPiece.pieces)
    if (!title) continue

    const existing = myTunesMap.get(userKnownPiece.piece_id)

    myTunesMap.set(userKnownPiece.piece_id, {
      piece_id: userKnownPiece.piece_id,
      title,
      inPractice: existing?.inPractice ?? false,
      known: true,
    })
  }

  const myTunes = Array.from(myTunesMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title)
  )

  const tunesByListId = new Map<number, Piece[]>()
  const learningQueueMap = new Map<number, LearningQueueTune>()

  for (const item of typedLearningListItemsWithPieces) {
    const piece = extractPiece(item.pieces)
    if (!piece) continue

    const existingTunes = tunesByListId.get(item.learning_list_id) ?? []
    existingTunes.push(piece)
    tunesByListId.set(item.learning_list_id, existingTunes)

    if (practicePieceIds.has(piece.id) || knownPieceIds.has(piece.id)) {
      continue
    }

    const list = extractList(item.learning_lists)
    if (!list) continue

    const sortValue = getQueueSortValue(item)
    const existingQueueTune = learningQueueMap.get(piece.id)

    if (!existingQueueTune) {
      learningQueueMap.set(piece.id, {
        piece,
        firstAddedAt: item.created_at,
        firstAddedSortValue: sortValue,
        firstListId: list.id,
        firstListName: list.name,
        listIds: [list.id],
        listNames: [list.name],
      })
      continue
    }

    if (!existingQueueTune.listIds.includes(list.id)) {
      existingQueueTune.listIds.push(list.id)
      existingQueueTune.listNames.push(list.name)
    }

    if (sortValue < existingQueueTune.firstAddedSortValue) {
      learningQueueMap.set(piece.id, {
        ...existingQueueTune,
        firstAddedAt: item.created_at,
        firstAddedSortValue: sortValue,
        firstListId: list.id,
        firstListName: list.name,
      })
    }
  }

  const learningQueueTunes = Array.from(learningQueueMap.values()).sort(
    (a, b) => {
      const dateCompare = a.firstAddedSortValue.localeCompare(
        b.firstAddedSortValue
      )

      if (dateCompare !== 0) return dateCompare

      return a.piece.title.localeCompare(b.piece.title)
    }
  )

  const bookmarkedListRows = typedBookmarkedSharedListRows
    .map((bookmark) => ({
      bookmark,
      list: extractBookmarkedList(bookmark.learning_lists),
    }))
    .filter(
      (entry): entry is {
        bookmark: LearningListBookmarkRow
        list: NonNullable<ReturnType<typeof extractBookmarkedList>>
      } => entry.list !== null
    )

  const bookmarkedListIds = bookmarkedListRows.map((entry) => entry.list.id)
  const directSharedListRowsWithLists = typedDirectSharedListRows
    .map((share) => ({
      share,
      list: extractDirectSharedList(share.learning_lists),
    }))
    .filter(
      (entry): entry is {
        share: DirectSharedListRow
        list: NonNullable<ReturnType<typeof extractDirectSharedList>>
      } => entry.list !== null
    )

  const directSharedListIds = directSharedListRowsWithLists.map(
    (entry) => entry.list.id
  )
  const bookmarkedOwnerIds = [
    ...new Set(bookmarkedListRows.map((entry) => entry.list.user_id)),
  ]
  const directSharedOwnerIds = [
    ...new Set(directSharedListRowsWithLists.map((entry) => entry.list.user_id)),
  ]

  let bookmarkProfilesById: Record<
    string,
    { username: string | null; displayName: string | null }
  > = {}
  let bookmarkCountsByListId: Record<number, number> = {}

  const sharedOwnerIds = Array.from(
    new Set([...bookmarkedOwnerIds, ...directSharedOwnerIds])
  )

  if (sharedOwnerIds.length > 0) {
    const { data: bookmarkProfiles, error: bookmarkProfilesError } =
      await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", sharedOwnerIds)

    if (bookmarkProfilesError) {
      throw new Error(bookmarkProfilesError.message)
    }

    bookmarkProfilesById = (
      (bookmarkProfiles ?? []) as BookmarkOwnerProfileRow[]
    ).reduce(
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

  if (bookmarkedListIds.length > 0) {
    const { data: bookmarkCountRows, error: bookmarkCountRowsError } =
      await supabase
        .from("learning_list_items")
        .select("learning_list_id")
        .in("learning_list_id", bookmarkedListIds)

    if (bookmarkCountRowsError) {
      throw new Error(bookmarkCountRowsError.message)
    }

    bookmarkCountsByListId = (
      (bookmarkCountRows ?? []) as BookmarkCountRow[]
    ).reduce((acc, row) => {
      acc[row.learning_list_id] = (acc[row.learning_list_id] ?? 0) + 1
      return acc
    }, {} as Record<number, number>)
  }

  let directSharedCountsByListId: Record<number, number> = {}

  if (directSharedListIds.length > 0) {
    const { data: directSharedCountRows, error: directSharedCountRowsError } =
      await supabase
        .from("learning_list_items")
        .select("learning_list_id")
        .in("learning_list_id", directSharedListIds)

    if (directSharedCountRowsError) {
      throw new Error(directSharedCountRowsError.message)
    }

    directSharedCountsByListId = (
      (directSharedCountRows ?? []) as BookmarkCountRow[]
    ).reduce((acc, row) => {
      acc[row.learning_list_id] = (acc[row.learning_list_id] ?? 0) + 1
      return acc
    }, {} as Record<number, number>)
  }

  const bookmarkedSharedLists: BookmarkedSharedListSummary[] =
    bookmarkedListRows.map(({ bookmark, list }) => {
      const ownerProfile = bookmarkProfilesById[list.user_id] ?? {
        username: null,
        displayName: null,
      }

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        ownerUserId: list.user_id,
        ownerUsername: ownerProfile.username,
        ownerDisplayName: ownerProfile.displayName,
        ownerLabel: formatBookmarkOwnerLabel(ownerProfile),
        tuneCount: bookmarkCountsByListId[list.id] ?? 0,
        bookmarkedAt: bookmark.created_at,
      }
    })

  const directSharedLists: DirectSharedListSummary[] =
    directSharedListRowsWithLists.map(({ share, list }) => {
      const ownerProfile = bookmarkProfilesById[list.user_id] ?? {
        username: null,
        displayName: null,
      }

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        ownerUserId: list.user_id,
        ownerUsername: ownerProfile.username,
        ownerDisplayName: ownerProfile.displayName,
        ownerLabel: formatBookmarkOwnerLabel(ownerProfile),
        tuneCount: directSharedCountsByListId[list.id] ?? 0,
        sharedAt: share.created_at,
      }
    })

  const listOverviews: FilterableLearningList[] = typedLearningLists.map(
    (list) => {
      const tunes = tunesByListId.get(list.id) ?? []
      const stylesPresent = Array.from(
        new Set(tunes.flatMap((tune) => getStyleLabelsFromPiece(tune)))
      ).sort()

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        visibility: list.visibility ?? "private",
        is_imported: Boolean(list.is_imported),
        tunes,
        tuneCount: tunes.length,
        stylesPresent,
        source: list.is_imported ? "imported" : "mine",
      }
    }
  )

  return {
    user,
    learningLists: typedLearningLists,
    listOverviews,
    myTunes,
    learningQueueTunes,
    unlistedPracticeTunes,
    unlistedKnownTunes,
    bookmarkedSharedLists,
    directSharedLists,
  }
}

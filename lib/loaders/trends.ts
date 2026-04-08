import { createClient } from "@/lib/supabase/server"
import type { LearningList, Piece, UserKnownPiece, UserPiece } from "@/lib/types"

type LearningListItemForPiece = {
  piece_id: number
  learning_list_id: number
  learning_lists: {
    id: number
    name: string
    user_id: string
  }
}

type RawLearningListItemForPiece = {
  piece_id: number
  learning_list_id: number
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

type PublicLearningListRow = {
  id: number
  user_id: string
  name: string
  description: string | null
}

type PublicListItemRow = {
  learning_list_id: number
  pieces:
    | {
        id: number
        style: string | null
      }
    | {
        id: number
        style: string | null
      }[]
    | null
}

type ProfileRow = {
  id: string
  username: string | null
}

type ConnectionRow = {
  requester_id: string
  addressee_id: string
}

type FriendRepertoireRow = {
  user_id: string
  piece_id: number
}

export type TrendTuneEntry = {
  piece: Piece
  count: number
}

export type StyleTrendPublicListEntry = {
  id: number
  name: string
  description: string | null
  ownerUsername: string | null
  matchingTuneCount: number
}

export type TrendSummaryCard = {
  label: string
  value: string
}

export type TrendLandingStyleEntry = {
  styleName: string
  slug: string
  tuneCount: number
  publicListCount: number
  topKnownTuneTitle: string | null
}

export type FriendPatternEntry = {
  label: string
  count: number
  href?: string
}

export type FriendTrendOverview = {
  friendCount: number
  styles: FriendPatternEntry[]
  keys: FriendPatternEntry[]
  topTunes: TrendTuneEntry[]
  friendCountByPiece: Map<number, number>
}

function slugifyStyle(style: string) {
  return style.toLowerCase().replace(/\s+/g, "-")
}

function buildCountMap(rows: { piece_id: number }[]) {
  const counts = new Map<number, number>()

  for (const row of rows) {
    counts.set(row.piece_id, (counts.get(row.piece_id) ?? 0) + 1)
  }

  return counts
}

function getMostCommonValue(values: Array<string | null | undefined>) {
  const counts = new Map<string, number>()

  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed) continue
    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1)
  }

  let winner: string | null = null
  let winnerCount = -1

  for (const [value, count] of counts.entries()) {
    if (count > winnerCount) {
      winner = value
      winnerCount = count
    }
  }

  return winner
}

function mapSetCountsToSortedEntries(
  input: Map<string, Set<string>>,
  hrefBuilder?: (label: string) => string
) {
  return Array.from(input.entries())
    .map(([label, friendIds]) => ({
      label,
      count: friendIds.size,
      href: hrefBuilder ? hrefBuilder(label) : undefined,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })
}

function normaliseLearningListItems(
  rows: RawLearningListItemForPiece[]
): LearningListItemForPiece[] {
  return rows
    .map((row) => {
      const learningList = Array.isArray(row.learning_lists)
        ? row.learning_lists[0]
        : row.learning_lists

      if (!learningList) {
        return null
      }

      return {
        piece_id: row.piece_id,
        learning_list_id: row.learning_list_id,
        learning_lists: {
          id: learningList.id,
          name: learningList.name,
          user_id: learningList.user_id,
        },
      }
    })
    .filter((row): row is LearningListItemForPiece => row !== null)
}

async function loadAcceptedFriendIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("connections")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  if (error) {
    throw new Error(`Failed to load accepted friends: ${error.message}`)
  }

  const rows = (data ?? []) as ConnectionRow[]

  return rows.map((row) =>
    row.requester_id === userId ? row.addressee_id : row.requester_id
  )
}

async function loadFriendRepertoireStats(
  supabase: Awaited<ReturnType<typeof createClient>>,
  friendIds: string[]
) {
  if (friendIds.length === 0) {
    return {
      friendCount: 0,
      styles: [] as FriendPatternEntry[],
      keys: [] as FriendPatternEntry[],
      topTunes: [] as TrendTuneEntry[],
      friendCountByPiece: new Map<number, number>(),
    }
  }

  const [knownRowsResult, practiceRowsResult] = await Promise.all([
    supabase
      .from("user_known_pieces")
      .select("user_id, piece_id")
      .in("user_id", friendIds),

    supabase.from("user_pieces").select("user_id, piece_id").in("user_id", friendIds),
  ])

  if (knownRowsResult.error) {
    throw new Error(
      `Failed to load friend known repertoire: ${knownRowsResult.error.message}`
    )
  }

  if (practiceRowsResult.error) {
    throw new Error(
      `Failed to load friend practice repertoire: ${practiceRowsResult.error.message}`
    )
  }

  const combinedRows = [
    ...((knownRowsResult.data ?? []) as FriendRepertoireRow[]),
    ...((practiceRowsResult.data ?? []) as FriendRepertoireRow[]),
  ]

  const uniqueFriendPieceKeys = new Set<string>()
  const uniqueFriendPieceRows: FriendRepertoireRow[] = []

  for (const row of combinedRows) {
    const key = `${row.user_id}:${row.piece_id}`
    if (uniqueFriendPieceKeys.has(key)) continue
    uniqueFriendPieceKeys.add(key)
    uniqueFriendPieceRows.push(row)
  }

  const pieceIds = Array.from(new Set(uniqueFriendPieceRows.map((row) => row.piece_id)))

  if (pieceIds.length === 0) {
    return {
      friendCount: friendIds.length,
      styles: [] as FriendPatternEntry[],
      keys: [] as FriendPatternEntry[],
      topTunes: [] as TrendTuneEntry[],
      friendCountByPiece: new Map<number, number>(),
    }
  }

  const { data: piecesData, error: piecesError } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature, reference_url")
    .in("id", pieceIds)

  if (piecesError) {
    throw new Error(
      `Failed to load friend repertoire pieces: ${piecesError.message}`
    )
  }

  const pieces = (piecesData ?? []) as Piece[]
  const piecesById = new Map(pieces.map((piece) => [piece.id, piece]))

  const pieceFriendSets = new Map<number, Set<string>>()
  const styleFriendSets = new Map<string, Set<string>>()
  const keyFriendSets = new Map<string, Set<string>>()

  for (const row of uniqueFriendPieceRows) {
    const piece = piecesById.get(row.piece_id)
    if (!piece) continue

    if (!pieceFriendSets.has(piece.id)) {
      pieceFriendSets.set(piece.id, new Set<string>())
    }
    pieceFriendSets.get(piece.id)?.add(row.user_id)

    const style = piece.style?.trim()
    if (style) {
      if (!styleFriendSets.has(style)) {
        styleFriendSets.set(style, new Set<string>())
      }
      styleFriendSets.get(style)?.add(row.user_id)
    }

    const key = piece.key?.trim()
    if (key) {
      if (!keyFriendSets.has(key)) {
        keyFriendSets.set(key, new Set<string>())
      }
      keyFriendSets.get(key)?.add(row.user_id)
    }
  }

  const friendCountByPiece = new Map<number, number>(
    Array.from(pieceFriendSets.entries()).map(([pieceId, friendSet]) => [
      pieceId,
      friendSet.size,
    ])
  )

  const topTunes = Array.from(friendCountByPiece.entries())
    .map(([pieceId, count]) => {
      const piece = piecesById.get(pieceId)
      if (!piece) return null

      return {
        piece,
        count,
      }
    })
    .filter((entry): entry is TrendTuneEntry => entry !== null)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.piece.title.localeCompare(b.piece.title)
    })
    .slice(0, 12)

  const styles = mapSetCountsToSortedEntries(styleFriendSets, (label) => {
    return `/trends/${slugifyStyle(label)}`
  }).slice(0, 6)

  const keys = mapSetCountsToSortedEntries(keyFriendSets).slice(0, 6)

  return {
    friendCount: friendIds.length,
    styles,
    keys,
    topTunes,
    friendCountByPiece,
  }
}

export async function loadTrendLandingData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [piecesResult, knownRowsResult, practiceRowsResult, publicListsResult] =
    await Promise.all([
      supabase
        .from("pieces")
        .select("id, title, style")
        .not("style", "is", null)
        .order("title", { ascending: true }),

      supabase.from("user_known_pieces").select("piece_id"),

      supabase.from("user_pieces").select("piece_id"),

      supabase.from("learning_lists").select("id").eq("visibility", "public"),
    ])

  if (piecesResult.error) {
    throw new Error(
      `Failed to load trend landing pieces: ${piecesResult.error.message}`
    )
  }

  if (knownRowsResult.error) {
    throw new Error(
      `Failed to load trend landing known counts: ${knownRowsResult.error.message}`
    )
  }

  if (practiceRowsResult.error) {
    throw new Error(
      `Failed to load trend landing practice counts: ${practiceRowsResult.error.message}`
    )
  }

  if (publicListsResult.error) {
    throw new Error(
      `Failed to load trend landing public lists: ${publicListsResult.error.message}`
    )
  }

  const pieces = (piecesResult.data ?? []) as Array<{
    id: number
    title: string
    style: string | null
  }>

  const knownCounts = buildCountMap(knownRowsResult.data ?? [])
  const practiceCounts = buildCountMap(practiceRowsResult.data ?? [])

  const styles = Array.from(
    new Set(
      pieces
        .map((piece) => piece.style?.trim())
        .filter((style): style is string => Boolean(style))
    )
  ).sort((a, b) => a.localeCompare(b))

  const mostKnownPiece =
    pieces
      .map((piece) => ({
        piece,
        count: knownCounts.get(piece.id) ?? 0,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.piece.title.localeCompare(b.piece.title)
      })[0] ?? null

  const mostPractisedPiece =
    pieces
      .map((piece) => ({
        piece,
        count: practiceCounts.get(piece.id) ?? 0,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.piece.title.localeCompare(b.piece.title)
      })[0] ?? null

  const publicListItemsResult =
    publicListsResult.data && publicListsResult.data.length > 0
      ? await supabase
          .from("learning_list_items")
          .select("learning_list_id, pieces(id, style)")
          .in(
            "learning_list_id",
            publicListsResult.data.map((list) => list.id)
          )
      : { data: [], error: null }

  if (publicListItemsResult.error) {
    throw new Error(
      `Failed to load trend landing public list items: ${publicListItemsResult.error.message}`
    )
  }

  const publicListItems = (publicListItemsResult.data ?? []) as PublicListItemRow[]

  const styleToPublicListIds = new Map<string, Set<number>>()

  for (const item of publicListItems) {
    const piece = Array.isArray(item.pieces) ? item.pieces[0] : item.pieces
    const style = piece?.style?.trim()

    if (!style) continue

    if (!styleToPublicListIds.has(style)) {
      styleToPublicListIds.set(style, new Set<number>())
    }

    styleToPublicListIds.get(style)?.add(item.learning_list_id)
  }

  const styleEntries: TrendLandingStyleEntry[] = styles.map((styleName) => {
    const stylePieces = pieces.filter((piece) => piece.style?.trim() === styleName)

    const topKnownTune =
      stylePieces
        .map((piece) => ({
          piece,
          count: knownCounts.get(piece.id) ?? 0,
        }))
        .sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count
          return a.piece.title.localeCompare(b.piece.title)
        })[0] ?? null

    return {
      styleName,
      slug: slugifyStyle(styleName),
      tuneCount: stylePieces.length,
      publicListCount: styleToPublicListIds.get(styleName)?.size ?? 0,
      topKnownTuneTitle: topKnownTune?.piece.title ?? null,
    }
  })

  const summaryCards: TrendSummaryCard[] = [
    {
      label: "Total tunes",
      value: String(pieces.length),
    },
    {
      label: "Public lists",
      value: String(publicListsResult.data?.length ?? 0),
    },
    {
      label: "Most known tune",
      value: mostKnownPiece
        ? `${mostKnownPiece.piece.title} (${mostKnownPiece.count})`
        : "None yet",
    },
    {
      label: "Most in practice",
      value: mostPractisedPiece
        ? `${mostPractisedPiece.piece.title} (${mostPractisedPiece.count})`
        : "None yet",
    },
  ]

  if (!user) {
    return {
      summaryCards,
      styleEntries,
      isAuthenticated: false,
      friendOverview: null as FriendTrendOverview | null,
      userPieces: [] as UserPiece[],
      userKnownPieces: [] as UserKnownPiece[],
      learningLists: [] as LearningList[],
      learningListItems: [] as LearningListItemForPiece[],
    }
  }

  const acceptedFriendIds = await loadAcceptedFriendIds(supabase, user.id)
  const friendOverview = await loadFriendRepertoireStats(supabase, acceptedFriendIds)

  const visiblePieceIds = friendOverview.topTunes.map((entry) => entry.piece.id)

  if (visiblePieceIds.length === 0) {
    return {
      summaryCards,
      styleEntries,
      isAuthenticated: true,
      friendOverview,
      userPieces: [] as UserPiece[],
      userKnownPieces: [] as UserKnownPiece[],
      learningLists: [] as LearningList[],
      learningListItems: [] as LearningListItemForPiece[],
    }
  }

  const [
    userPiecesResult,
    userKnownPiecesResult,
    learningListsResult,
    learningListItemsResult,
  ] = await Promise.all([
    supabase
      .from("user_pieces")
      .select("id, piece_id, status, next_review_due, stage")
      .eq("user_id", user.id)
      .in("piece_id", visiblePieceIds),

    supabase
      .from("user_known_pieces")
      .select("id, piece_id")
      .eq("user_id", user.id)
      .in("piece_id", visiblePieceIds),

    supabase
      .from("learning_lists")
      .select("id, name, description")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),

    supabase
      .from("learning_list_items")
      .select(
        "piece_id, learning_list_id, learning_lists!inner(id, name, user_id)"
      )
      .in("piece_id", visiblePieceIds)
      .eq("learning_lists.user_id", user.id),
  ])

  if (userPiecesResult.error) {
    throw new Error(userPiecesResult.error.message)
  }

  if (userKnownPiecesResult.error) {
    throw new Error(userKnownPiecesResult.error.message)
  }

  if (learningListsResult.error) {
    throw new Error(learningListsResult.error.message)
  }

  if (learningListItemsResult.error) {
    throw new Error(learningListItemsResult.error.message)
  }

  return {
    summaryCards,
    styleEntries,
    isAuthenticated: true,
    friendOverview,
    userPieces: (userPiecesResult.data ?? []) as UserPiece[],
    userKnownPieces: (userKnownPiecesResult.data ?? []) as UserKnownPiece[],
    learningLists: (learningListsResult.data ?? []) as LearningList[],
    learningListItems: normaliseLearningListItems(
      (learningListItemsResult.data ?? []) as RawLearningListItemForPiece[]
    ),
  }
}

export async function loadStyleTrendData(styleSlug: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = Boolean(user)

  const { data: pieces, error: piecesError } = await supabase
    .from("pieces")
    .select("id, title, key, style, time_signature, reference_url")
    .not("style", "is", null)
    .order("title", { ascending: true })

  if (piecesError) {
    throw new Error(
      `Failed to load pieces for style trends: ${piecesError.message}`
    )
  }

  const matchingPieces = ((pieces ?? []) as Piece[]).filter(
    (piece) => piece.style && slugifyStyle(piece.style) === styleSlug
  )

  if (matchingPieces.length === 0) {
    return {
      isAuthenticated,
      styleName: null,
      summaryCards: [] as TrendSummaryCard[],
      popularAmongFriendsTunes: [] as TrendTuneEntry[],
      recommendedTunes: [] as TrendTuneEntry[],
      topKnownTunes: [] as TrendTuneEntry[],
      topPracticeTunes: [] as TrendTuneEntry[],
      topPublicLists: [] as StyleTrendPublicListEntry[],
      userPieces: [] as UserPiece[],
      userKnownPieces: [] as UserKnownPiece[],
      learningLists: [] as LearningList[],
      learningListItems: [] as LearningListItemForPiece[],
    }
  }

  const pieceIds = matchingPieces.map((piece) => piece.id)

  const [knownRowsResult, practiceRowsResult, publicListsResult] =
    await Promise.all([
      supabase
        .from("user_known_pieces")
        .select("piece_id")
        .in("piece_id", pieceIds),

      supabase.from("user_pieces").select("piece_id").in("piece_id", pieceIds),

      supabase
        .from("learning_lists")
        .select("id, user_id, name, description")
        .eq("visibility", "public")
        .order("name", { ascending: true }),
    ])

  if (knownRowsResult.error) {
    throw new Error(
      `Failed to load known tune counts for style trends: ${knownRowsResult.error.message}`
    )
  }

  if (practiceRowsResult.error) {
    throw new Error(
      `Failed to load practice tune counts for style trends: ${practiceRowsResult.error.message}`
    )
  }

  if (publicListsResult.error) {
    throw new Error(
      `Failed to load public lists for style trends: ${publicListsResult.error.message}`
    )
  }

  const knownCounts = buildCountMap(knownRowsResult.data ?? [])
  const practiceCounts = buildCountMap(practiceRowsResult.data ?? [])

  const rankedKnownTunes = matchingPieces
    .map((piece) => ({
      piece,
      count: knownCounts.get(piece.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.piece.title.localeCompare(b.piece.title)
    })

  const topKnownTunes = rankedKnownTunes.slice(0, 12)

  const rankedPracticeTunes = matchingPieces
    .map((piece) => ({
      piece,
      count: practiceCounts.get(piece.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.piece.title.localeCompare(b.piece.title)
    })

  const topPracticeTunes = rankedPracticeTunes.slice(0, 12)

  const publicLists = (publicListsResult.data ?? []) as PublicLearningListRow[]
  const publicListIds = publicLists.map((list) => list.id)
  const ownerIds = Array.from(new Set(publicLists.map((list) => list.user_id)))

  let topPublicLists: StyleTrendPublicListEntry[] = []

  if (publicListIds.length > 0) {
    const [publicListItemsResult, ownerProfilesResult] = await Promise.all([
      supabase
        .from("learning_list_items")
        .select("learning_list_id, pieces(id, style)")
        .in("learning_list_id", publicListIds),

      supabase.from("profiles").select("id, username").in("id", ownerIds),
    ])

    if (publicListItemsResult.error) {
      throw new Error(
        `Failed to load public list items for style trends: ${publicListItemsResult.error.message}`
      )
    }

    if (ownerProfilesResult.error) {
      throw new Error(
        `Failed to load public list owners for style trends: ${ownerProfilesResult.error.message}`
      )
    }

    const publicListItems = (publicListItemsResult.data ?? []) as PublicListItemRow[]
    const ownerProfiles = (ownerProfilesResult.data ?? []) as ProfileRow[]

    const ownerUsernameById = new Map(
      ownerProfiles.map((profile) => [profile.id, profile.username])
    )

    const matchingCountByListId = new Map<number, number>()

    for (const item of publicListItems) {
      const piece = Array.isArray(item.pieces) ? item.pieces[0] : item.pieces

      if (!piece?.style) continue
      if (slugifyStyle(piece.style) !== styleSlug) continue

      matchingCountByListId.set(
        item.learning_list_id,
        (matchingCountByListId.get(item.learning_list_id) ?? 0) + 1
      )
    }

    topPublicLists = publicLists
      .map((list) => ({
        id: list.id,
        name: list.name,
        description: list.description,
        ownerUsername: ownerUsernameById.get(list.user_id) ?? null,
        matchingTuneCount: matchingCountByListId.get(list.id) ?? 0,
      }))
      .filter((list) => list.matchingTuneCount > 0)
      .sort((a, b) => {
        if (b.matchingTuneCount !== a.matchingTuneCount) {
          return b.matchingTuneCount - a.matchingTuneCount
        }

        return a.name.localeCompare(b.name)
      })
      .slice(0, 8)
  }

  const summaryCards: TrendSummaryCard[] = [
    {
      label: "Tunes in this style",
      value: String(matchingPieces.length),
    },
    {
      label: "Public lists",
      value: String(topPublicLists.length),
    },
    {
      label: "Most common key",
      value:
        getMostCommonValue(matchingPieces.map((piece) => piece.key)) ?? "Unknown",
    },
    {
      label: "Most common time signature",
      value:
        getMostCommonValue(matchingPieces.map((piece) => piece.time_signature)) ??
        "Unknown",
    },
  ]

  let popularAmongFriendsTunes: TrendTuneEntry[] = []

  if (user) {
    const acceptedFriendIds = await loadAcceptedFriendIds(supabase, user.id)
    const friendOverview = await loadFriendRepertoireStats(supabase, acceptedFriendIds)

    popularAmongFriendsTunes = matchingPieces
      .map((piece) => ({
        piece,
        count: friendOverview.friendCountByPiece.get(piece.id) ?? 0,
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count
        return a.piece.title.localeCompare(b.piece.title)
      })
      .slice(0, 12)
  }

  if (!user) {
    return {
      isAuthenticated,
      styleName: matchingPieces[0].style,
      summaryCards,
      popularAmongFriendsTunes,
      recommendedTunes: topKnownTunes,
      topKnownTunes,
      topPracticeTunes,
      topPublicLists,
      userPieces: [] as UserPiece[],
      userKnownPieces: [] as UserKnownPiece[],
      learningLists: [] as LearningList[],
      learningListItems: [] as LearningListItemForPiece[],
    }
  }

  const [userPiecesResult, userKnownPiecesResult, learningListsResult] =
    await Promise.all([
      supabase
        .from("user_pieces")
        .select("id, piece_id, status, next_review_due, stage")
        .eq("user_id", user.id)
        .in("piece_id", pieceIds),

      supabase
        .from("user_known_pieces")
        .select("id, piece_id")
        .eq("user_id", user.id)
        .in("piece_id", pieceIds),

      supabase
        .from("learning_lists")
        .select("id, name, description")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
    ])

  if (userPiecesResult.error) {
    throw new Error(userPiecesResult.error.message)
  }

  if (userKnownPiecesResult.error) {
    throw new Error(userKnownPiecesResult.error.message)
  }

  if (learningListsResult.error) {
    throw new Error(learningListsResult.error.message)
  }

  const userPieces = (userPiecesResult.data ?? []) as UserPiece[]
  const userKnownPieces = (userKnownPiecesResult.data ?? []) as UserKnownPiece[]
  const learningLists = (learningListsResult.data ?? []) as LearningList[]

  const activePieceIds = new Set(userPieces.map((row) => row.piece_id))
  const knownPieceIds = new Set(userKnownPieces.map((row) => row.piece_id))

  const recommendedTunes = rankedKnownTunes
    .filter(
      (entry) =>
        !activePieceIds.has(entry.piece.id) && !knownPieceIds.has(entry.piece.id)
    )
    .slice(0, 12)

  const visiblePieceIds = Array.from(
    new Set([
      ...popularAmongFriendsTunes.map((entry) => entry.piece.id),
      ...recommendedTunes.map((entry) => entry.piece.id),
      ...topKnownTunes.map((entry) => entry.piece.id),
      ...topPracticeTunes.map((entry) => entry.piece.id),
    ])
  )

  const learningListItemsResult =
    visiblePieceIds.length > 0
      ? await supabase
          .from("learning_list_items")
          .select(
            "piece_id, learning_list_id, learning_lists!inner(id, name, user_id)"
          )
          .in("piece_id", visiblePieceIds)
          .eq("learning_lists.user_id", user.id)
      : { data: [], error: null }

  if (learningListItemsResult.error) {
    throw new Error(learningListItemsResult.error.message)
  }

  return {
    isAuthenticated,
    styleName: matchingPieces[0].style,
    summaryCards,
    popularAmongFriendsTunes,
    recommendedTunes,
    topKnownTunes,
    topPracticeTunes,
    topPublicLists,
    userPieces,
    userKnownPieces,
    learningLists,
    learningListItems: normaliseLearningListItems(
      (learningListItemsResult.data ?? []) as RawLearningListItemForPiece[]
    ),
  }
}
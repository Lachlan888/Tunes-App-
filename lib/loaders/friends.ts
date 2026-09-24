import { activityCursor, ACTIVITY_PAGE_SIZE, type ActivityCursor } from "@/lib/activity-pagination"
import { redirectToLogin } from "@/lib/auth/login-redirect"
import { readBoundedRows } from "@/lib/loaders/bounded-read"
import { createClient } from "@/lib/supabase/server"
import {
  searchProfilesForSelection,
  type ProfileSearchRow,
} from "@/lib/profile-search"
import type {
  ActivityEventType,
  ActivityReactionSummary,
  ActivityReplyItem,
  FriendActivityItem,
  FriendActivityProfile,
} from "@/lib/friend-activity"
import type { BadgeCategory } from "@/lib/types"

type ConnectionRow = {
  id: number
  status: "pending" | "accepted"
  created_at: string
  accepted_at: string | null
  requester_id: string
  addressee_id: string
}

type ActivityEventRow = {
  id: number
  user_id: string
  event_type: ActivityEventType
  piece_id: number | null
  learning_list_id: number | null
  comment_id: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type ActivityProfileRow = {
  id: string
  username: string | null
  display_name: string | null
  show_repertoire_summary: boolean | null
  show_comment_activity: boolean | null
  show_public_lists_on_profile: boolean | null
}

type PieceRow = {
  id: number
  title: string
}

type LearningListRow = {
  id: number
  name: string
  visibility: string | null
}

type PieceCommentRow = {
  id: number
  body: string
}

type ActivityReactionRow = {
  id: number
  activity_event_id: number
  user_id: string
  reaction_type: string
}

type ActivityReplyRow = {
  id: number
  activity_event_id: number
  user_id: string
  body: string
  created_at: string
}

type BadgeRow = {
  id: number
  owner_user_id: string
  name: string
  slug: string
  category: BadgeCategory
  description: string | null
}

export type FriendSearchMatch = {
  id: string
  username: string | null
  display_name: string | null
  match_score: number
}

export type PendingFriendRequest = {
  connection_id: number
  requester_id: string
  username: string | null
  display_name: string | null
  created_at: string
}

export type AcceptedFriend = {
  connection_id: number
  user_id: string
  username: string | null
  display_name: string | null
  accepted_at: string | null
}

function buildReactionSummaries(
  reactions: ActivityReactionRow[],
  currentUserId: string
): ActivityReactionSummary[] {
  const summaryMap = new Map<string, ActivityReactionSummary>()

  for (const reaction of reactions) {
    const existing = summaryMap.get(reaction.reaction_type) ?? {
      reaction_type: reaction.reaction_type,
      count: 0,
      user_has_reacted: false,
    }

    existing.count += 1

    if (reaction.user_id === currentUserId) {
      existing.user_has_reacted = true
    }

    summaryMap.set(reaction.reaction_type, existing)
  }

  return Array.from(summaryMap.values())
}

function isRepertoireActivity(eventType: ActivityEventType) {
  return (
    eventType === "started_practice" ||
    eventType === "tune_reviewed" ||
    eventType === "marked_known"
  )
}

function isCommentOrContributionActivity(eventType: ActivityEventType) {
  return (
    eventType === "comment_added" ||
    eventType === "piece_created" ||
    eventType === "piece_details_added" ||
    eventType === "piece_lore_added" ||
    eventType === "piece_media_link_added" ||
    eventType === "piece_sheet_music_link_added"
  )
}

function isPublicListActivity(eventType: ActivityEventType) {
  return eventType === "public_list_created" || eventType === "public_list_updated"
}

function isBadgeActivity(eventType: ActivityEventType) {
  return eventType === "badge_created" || eventType === "badge_awarded"
}

const MEANINGFUL_ACTIVITY_TYPES = new Set<ActivityEventType>([
  "started_practice",
  "tune_reviewed",
  "marked_known",
  "public_list_created",
  "badge_awarded",
])

export function prioritiseMusicalActivity<T extends {
  user_id: string
  event_type: ActivityEventType
  piece_id: number | null
  learning_list_id: number | null
}>(rows: T[], limit: number) {
  const seen = new Set<string>()

  return rows
    .filter((row) => MEANINGFUL_ACTIVITY_TYPES.has(row.event_type))
    .filter((row) => {
      const subject = row.piece_id ?? row.learning_list_id ?? "none"
      const key = `${row.user_id}:${row.event_type}:${subject}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, limit)
}

export function canShowActivityForProfile(
  row: ActivityEventRow,
  profile: ActivityProfileRow | null
) {
  if (!profile) {
    return false
  }

  if (isRepertoireActivity(row.event_type)) {
    return profile.show_repertoire_summary === true
  }

  if (isCommentOrContributionActivity(row.event_type)) {
    return profile.show_comment_activity !== false
  }

  if (isPublicListActivity(row.event_type)) {
    return profile.show_public_lists_on_profile !== false
  }

  if (isBadgeActivity(row.event_type)) {
    return true
  }

  return false
}

function getMetadataNumber(
  metadata: Record<string, unknown> | null,
  key: string
) {
  const value = metadata?.[key]

  if (typeof value === "number" && Number.isInteger(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isInteger(parsed) ? parsed : null
  }

  return null
}

function getMetadataString(
  metadata: Record<string, unknown> | null,
  key: string
) {
  const value = metadata?.[key]
  return typeof value === "string" ? value : null
}

async function loadProfilesByUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
) {
  const uniqueUserIds = Array.from(new Set(userIds)).filter(Boolean)

  if (uniqueUserIds.length === 0) {
    return new Map<string, FriendActivityProfile>()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", uniqueUserIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Map(
    ((data ?? []) as FriendActivityProfile[]).map((profile) => [
      profile.id,
      profile,
    ])
  )
}

export async function loadFriendActivityPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  acceptedFriendIds: string[],
  currentUserId: string,
  limit = ACTIVITY_PAGE_SIZE,
  cursor: ActivityCursor | null = null
): Promise<{ items: FriendActivityItem[]; nextCursor: string | null }> {
  if (acceptedFriendIds.length === 0) {
    return { items: [], nextCursor: null }
  }
  limit = Math.max(1, Math.min(25, limit))

  const activityRows: ActivityEventRow[] = []
  for (let start = 0; start < acceptedFriendIds.length; start += 200) {
  let query = supabase
    .from("user_activity_events")
    .select(
      "id, user_id, event_type, piece_id, learning_list_id, comment_id, metadata, created_at"
    )
    .in("user_id", acceptedFriendIds.slice(start, start + 200))
    .in("event_type", [...MEANINGFUL_ACTIVITY_TYPES])
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit)
  if (cursor) query = query.or(`created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`)
  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }
  activityRows.push(...(data ?? []) as ActivityEventRow[])
  }

  const typedActivityRows = activityRows.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id).slice(0, limit)

  const activityUserIds = Array.from(
    new Set(typedActivityRows.map((row) => row.user_id))
  )

  let activityProfilesById = new Map<string, ActivityProfileRow>()

  if (activityUserIds.length > 0) {
    const { data: activityProfiles, error: activityProfilesError } =
      await supabase
        .from("profiles")
        .select(
          `
            id,
            username,
            display_name,
            show_repertoire_summary,
            show_comment_activity,
            show_public_lists_on_profile
          `
        )
        .in("id", activityUserIds)

    if (activityProfilesError) {
      throw new Error(activityProfilesError.message)
    }

    activityProfilesById = new Map(
      ((activityProfiles ?? []) as ActivityProfileRow[]).map((profile) => [
        profile.id,
        profile,
      ])
    )
  }

  const visibleActivityRows = typedActivityRows.filter(row => canShowActivityForProfile(row, activityProfilesById.get(row.user_id) ?? null))

  const activityIds = visibleActivityRows.map((row) => row.id)

  const pieceIds = Array.from(
    new Set(
      visibleActivityRows
        .map((row) => row.piece_id)
        .filter((value): value is number => value !== null)
    )
  )

  const learningListIds = Array.from(
    new Set(
      visibleActivityRows
        .map((row) => row.learning_list_id)
        .filter((value): value is number => value !== null)
    )
  )

  const commentIds = Array.from(
    new Set(
      visibleActivityRows
        .map((row) => row.comment_id)
        .filter((value): value is number => value !== null)
    )
  )

  const badgeIds = Array.from(
    new Set(
      visibleActivityRows
        .map((row) => getMetadataNumber(row.metadata, "badge_id"))
        .filter((value): value is number => value !== null)
    )
  )

  const badgeAwarderIds = Array.from(
    new Set(
      visibleActivityRows
        .map((row) => getMetadataString(row.metadata, "awarded_by_user_id"))
        .filter((value): value is string => value !== null)
    )
  )

  const [
    piecesById,
    learningListsById,
    commentsById,
    badgesById,
    badgeAwarderProfilesById,
    reactionsResult,
    repliesResult,
  ] = await Promise.all([
    pieceIds.length > 0
      ? supabase
          .from("pieces")
          .select("id, title")
          .in("id", pieceIds)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as PieceRow[]).map((piece) => [piece.id, piece])
            )
          })
      : Promise.resolve(new Map<number, PieceRow>()),
    learningListIds.length > 0
      ? supabase
          .from("learning_lists")
          .select("id, name, visibility")
          .in("id", learningListIds)
          .eq("visibility", "public")
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as LearningListRow[]).map((list) => [list.id, list])
            )
          })
      : Promise.resolve(new Map<number, LearningListRow>()),
    commentIds.length > 0
      ? supabase
          .from("piece_comments")
          .select("id, body")
          .in("id", commentIds)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as PieceCommentRow[]).map((comment) => [
                comment.id,
                comment,
              ])
            )
          })
      : Promise.resolve(new Map<number, PieceCommentRow>()),
    badgeIds.length > 0
      ? supabase
          .from("badges")
          .select("id, owner_user_id, name, slug, category, description")
          .in("id", badgeIds)
          .eq("visibility", "public")
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as BadgeRow[]).map((badge) => [badge.id, badge])
            )
          })
      : Promise.resolve(new Map<number, BadgeRow>()),
    loadProfilesByUserId(supabase, badgeAwarderIds),
    activityIds.length > 0
      ? supabase
          .from("activity_reactions")
          .select("id, activity_event_id, user_id, reaction_type")
          .in("activity_event_id", activityIds)
      : Promise.resolve({ data: [], error: null }),
    activityIds.length > 0
      ? supabase
          .from("activity_replies")
          .select("id, activity_event_id, user_id, body, created_at")
          .in("activity_event_id", activityIds)
          .order("created_at", { ascending: true })
          .limit(200)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (reactionsResult.error) throw new Error(reactionsResult.error.message)
  if (repliesResult.error) throw new Error(repliesResult.error.message)

  const typedReactions = (reactionsResult.data ?? []) as ActivityReactionRow[]
  const reactionsByRawActivityId = typedReactions.reduce<
    Map<number, ActivityReactionRow[]>
  >((map, reaction) => {
    const existing = map.get(reaction.activity_event_id) ?? []
    existing.push(reaction)
    map.set(reaction.activity_event_id, existing)
    return map
  }, new Map())
  const reactionsByActivityId = new Map(
    Array.from(reactionsByRawActivityId.entries()).map(
      ([activityEventId, rows]) => [
        activityEventId,
        buildReactionSummaries(rows, currentUserId),
      ]
    )
  )

  const typedReplies = (repliesResult.data ?? []) as ActivityReplyRow[]
  const replyProfilesById = await loadProfilesByUserId(
    supabase,
    typedReplies.map((row) => row.user_id)
  )
  const repliesByActivityId = typedReplies.reduce<
    Map<number, ActivityReplyItem[]>
  >((map, reply) => {
    const existing = map.get(reply.activity_event_id) ?? []
    const author = replyProfilesById.get(reply.user_id) ?? null

    existing.push({
      id: reply.id,
      body: reply.body,
      created_at: reply.created_at,
      author,
    })

    map.set(reply.activity_event_id, existing)
    return map
  }, new Map())

  const items: FriendActivityItem[] = []

  for (const row of visibleActivityRows) {
    const actor = activityProfilesById.get(row.user_id) ?? null
    const piece =
      row.piece_id != null ? piecesById.get(row.piece_id) ?? null : null
    const learningList =
      row.learning_list_id != null
        ? learningListsById.get(row.learning_list_id) ?? null
        : null
    const comment =
      row.comment_id != null ? commentsById.get(row.comment_id) ?? null : null
    const badgeId = getMetadataNumber(row.metadata, "badge_id")
    const badge = badgeId != null ? badgesById.get(badgeId) ?? null : null
    const awardedByUserId = getMetadataString(row.metadata, "awarded_by_user_id")
    const awardedByProfile = awardedByUserId
      ? badgeAwarderProfilesById.get(awardedByUserId) ?? null
      : null

    if (
      (row.event_type === "public_list_created" ||
        row.event_type === "public_list_updated") &&
      !learningList
    ) {
      continue
    }

    if (
      (row.event_type === "started_practice" ||
        row.event_type === "tune_reviewed" ||
        row.event_type === "marked_known" ||
        row.event_type === "comment_added" ||
        row.event_type === "piece_created" ||
        row.event_type === "piece_details_added" ||
        row.event_type === "piece_lore_added" ||
        row.event_type === "piece_media_link_added" ||
        row.event_type === "piece_sheet_music_link_added") &&
      !piece
    ) {
      continue
    }

    if (isBadgeActivity(row.event_type) && !badge) {
      continue
    }

    items.push({
      id: row.id,
      activity_key: `activity-${row.id}`,
      is_interactable: true,
      created_at: row.created_at,
      event_type: row.event_type,
      metadata: row.metadata,
      actor: actor
        ? {
            id: actor.id,
            username: actor.username,
            display_name: actor.display_name,
          }
        : null,
      piece: piece
        ? {
            id: piece.id,
            title: piece.title,
          }
        : null,
      learning_list: learningList
        ? {
            id: learningList.id,
            name: learningList.name,
          }
        : null,
      comment: comment
        ? {
            id: comment.id,
            body: comment.body,
          }
        : null,
      badge: badge
        ? {
            id: badge.id,
            name: badge.name,
            slug: badge.slug,
            category: badge.category,
            description: badge.description,
            owner_user_id: badge.owner_user_id,
          }
        : null,
      awarded_by_profile: awardedByProfile,
      reactions: reactionsByActivityId.get(row.id) ?? [],
      replies: repliesByActivityId.get(row.id) ?? [],
    })
  }

  const last = typedActivityRows.at(-1)
  return { items, nextCursor: typedActivityRows.length === limit && last ? activityCursor(last) : null }
}

export async function loadRecentFriendActivity(supabase: Awaited<ReturnType<typeof createClient>>, acceptedFriendIds: string[], currentUserId: string, limit = 25) {
  return (await loadFriendActivityPage(supabase, acceptedFriendIds, currentUserId, limit)).items
}

export async function loadFriendsPageData(searchQuery?: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirectToLogin()
  }

  const trimmedQuery = (searchQuery ?? "").trim()

  const connectionRows = await readBoundedRows((from, to) => supabase
    .from("connections")
    .select("id, status, created_at, accepted_at, requester_id, addressee_id", { count: "exact" })
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .order("created_at", { ascending: false }).order("id").range(from, to))

  const typedConnections = (connectionRows ?? []) as ConnectionRow[]

  const connectedUserIds = Array.from(
    new Set(
      typedConnections.flatMap((row) => [row.requester_id, row.addressee_id])
    )
  ).filter((id) => id !== user.id)

  const connectionProfilesById = new Map<string, ProfileSearchRow>()

  for (let start = 0; start < connectedUserIds.length; start += 200) {
    const connectionProfiles = await readBoundedRows((from, to) => supabase
        .from("profiles")
        .select("id, username, display_name", { count: "exact" })
        .in("id", connectedUserIds.slice(start, start + 200)).order("id").range(from, to))
    for (const profile of connectionProfiles as ProfileSearchRow[]) connectionProfilesById.set(profile.id, profile)
  }

  const pendingIncomingRequests: PendingFriendRequest[] = typedConnections
    .filter((row) => row.status === "pending" && row.addressee_id === user.id)
    .map((row) => {
      const requester = connectionProfilesById.get(row.requester_id)

      return {
        connection_id: row.id,
        requester_id: row.requester_id,
        username: requester?.username ?? null,
        display_name: requester?.display_name ?? null,
        created_at: row.created_at,
      }
    })

  const acceptedFriends: AcceptedFriend[] = typedConnections
    .filter((row) => row.status === "accepted")
    .map((row) => {
      const otherUserId =
        row.requester_id === user.id ? row.addressee_id : row.requester_id
      const otherProfile = connectionProfilesById.get(otherUserId)

      return {
        connection_id: row.id,
        user_id: otherUserId,
        username: otherProfile?.username ?? null,
        display_name: otherProfile?.display_name ?? null,
        accepted_at: row.accepted_at,
      }
    })

  let searchMatches: FriendSearchMatch[] = []

  if (trimmedQuery) {
    searchMatches = await searchProfilesForSelection({
      query: trimmedQuery,
      currentUserId: user.id,
      excludeIds: connectedUserIds,
      limit: 10,
      requireCompareDiscoverability: false,
    })
  }

  const acceptedFriendIds = acceptedFriends.map((friend) => friend.user_id)

  const activityPage = await loadFriendActivityPage(
    supabase,
    acceptedFriendIds,
    user.id
  )

  return {
    user,
    pendingIncomingRequests,
    acceptedFriends,
    searchMatches,
    searchQuery: trimmedQuery,
    recentFriendActivity: activityPage.items,
    activityNextCursor: activityPage.nextCursor,
  }
}

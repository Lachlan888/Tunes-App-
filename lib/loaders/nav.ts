import { canModerate, isAppAdmin } from "@/lib/auth/roles"
import { getToday } from "@/lib/review"
import type { SupabaseServerClient } from "@/lib/auth/session"
import type { UserRole } from "@/lib/types"

export type NavContext = {
  role: UserRole
  canModerate: boolean
  canAccessDev: boolean
  unreadNotificationCount: number
  unreadMessageCount: number
  unreadTotalCount: number
  pendingFriendRequestCount: number
  socialAttentionCount: number
  overduePracticeCount: number
  pendingModerationCount: number
}

export const emptyNavContext: NavContext = {
  role: "user",
  canModerate: false,
  canAccessDev: false,
  unreadNotificationCount: 0,
  unreadMessageCount: 0,
  unreadTotalCount: 0,
  pendingFriendRequestCount: 0,
  socialAttentionCount: 0,
  overduePracticeCount: 0,
  pendingModerationCount: 0,
}

function normaliseRole(role: string | null | undefined): UserRole {
  if (role === "moderator" || role === "admin") {
    return role
  }

  return "user"
}

async function loadRole(
  supabase: SupabaseServerClient,
  userId: string
): Promise<UserRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    console.error("Error loading nav role:", error)
    return "user"
  }

  return normaliseRole(data?.role)
}

async function loadPendingModerationCount(supabase: SupabaseServerClient) {
  const [
    { count: pendingPieceEditRequestCount, error: pieceEditRequestError },
    { count: pendingCommentReportCount, error: commentReportError },
    { count: pendingLoreReportCount, error: loreReportError },
  ] = await Promise.all([
    supabase
      .from("piece_edit_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("comment_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("piece_lore_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ])

  if (pieceEditRequestError) {
    console.error(
      "Error loading pending piece edit request count:",
      pieceEditRequestError
    )
  }

  if (commentReportError) {
    console.error("Error loading pending comment report count:", commentReportError)
  }

  if (loreReportError) {
    console.error("Error loading pending lore report count:", loreReportError)
  }

  const safePendingPieceEditRequestCount =
    pieceEditRequestError || pendingPieceEditRequestCount === null
      ? 0
      : pendingPieceEditRequestCount

  const safePendingCommentReportCount =
    commentReportError || pendingCommentReportCount === null
      ? 0
      : pendingCommentReportCount

  const safePendingLoreReportCount =
    loreReportError || pendingLoreReportCount === null
      ? 0
      : pendingLoreReportCount

  return (
    safePendingPieceEditRequestCount +
    safePendingCommentReportCount +
    safePendingLoreReportCount
  )
}

export async function loadNavContext(
  supabase: SupabaseServerClient,
  userId: string
): Promise<NavContext> {
  const [role, userCanAccessDev] = await Promise.all([
    loadRole(supabase, userId),
    isAppAdmin(supabase, userId),
  ])

  const userCanModerate = canModerate(role)

  const [
    { count: unreadNotificationCount, error: notificationError },
    { count: unreadMessageCount, error: messageError },
    { count: pendingFriendRequestCount, error: friendRequestError },
    { count: overduePracticeRowCount, error: practiceError },
    pendingModerationCount,
  ] = await Promise.all([
    supabase
      .from("user_notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_id", userId)
      .neq("notification_type", "direct_message")
      .is("read_at", null)
      .is("archived_at", null),

    supabase
      .from("direct_messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_user_id", userId)
      .is("read_at", null)
      .is("recipient_archived_at", null),

    supabase
      .from("connections")
      .select("id", { count: "exact", head: true })
      .eq("addressee_id", userId)
      .eq("status", "pending"),

    supabase
      .from("user_pieces")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "learning")
      .not("next_review_due", "is", null)
      .lt("next_review_due", getToday()),

    userCanModerate ? loadPendingModerationCount(supabase) : Promise.resolve(0),
  ])

  if (notificationError) {
    console.error("Error loading unread notification count:", notificationError)
  }

  if (messageError) {
    console.error("Error loading unread direct message count:", messageError)
  }

  if (friendRequestError) {
    console.error(
      "Error loading pending incoming friend request count:",
      friendRequestError
    )
  }

  if (practiceError) {
    console.error("Error loading overdue practice count:", practiceError)
  }

  const safeUnreadNotificationCount =
    notificationError || unreadNotificationCount === null
      ? 0
      : unreadNotificationCount

  const safeUnreadMessageCount =
    messageError || unreadMessageCount === null ? 0 : unreadMessageCount

  const safePendingFriendRequestCount =
    friendRequestError || pendingFriendRequestCount === null
      ? 0
      : pendingFriendRequestCount

  const unreadTotalCount = safeUnreadNotificationCount + safeUnreadMessageCount

  const overduePracticeCount =
    practiceError || overduePracticeRowCount === null
      ? 0
      : overduePracticeRowCount

  return {
    role,
    canModerate: userCanModerate,
    canAccessDev: userCanAccessDev,
    unreadNotificationCount: safeUnreadNotificationCount,
    unreadMessageCount: safeUnreadMessageCount,
    unreadTotalCount,
    pendingFriendRequestCount: safePendingFriendRequestCount,
    socialAttentionCount: unreadTotalCount + safePendingFriendRequestCount,
    overduePracticeCount,
    pendingModerationCount,
  }
}

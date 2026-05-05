import { isOverdue } from "@/lib/review"
import type { createClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export type NavCounts = {
  unreadNotificationCount: number
  unreadMessageCount: number
  unreadTotalCount: number
  overduePracticeCount: number
}

export async function loadNavCounts(
  supabase: SupabaseServerClient,
  userId: string
): Promise<NavCounts> {
  const [
    { count: unreadNotificationCount, error: notificationError },
    { count: unreadMessageCount, error: messageError },
    { data: practiceRows, error: practiceError },
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
      .from("user_pieces")
      .select("id, next_review_due")
      .eq("user_id", userId),
  ])

  if (notificationError) {
    console.error("Error loading unread notification count:", notificationError)
  }

  if (messageError) {
    console.error("Error loading unread direct message count:", messageError)
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

  const overduePracticeCount = practiceError
    ? 0
    : (practiceRows ?? []).filter((row) => isOverdue(row.next_review_due))
        .length

  return {
    unreadNotificationCount: safeUnreadNotificationCount,
    unreadMessageCount: safeUnreadMessageCount,
    unreadTotalCount: safeUnreadNotificationCount + safeUnreadMessageCount,
    overduePracticeCount,
  }
}
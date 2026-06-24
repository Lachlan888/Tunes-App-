import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getActivitySummaryText } from "@/lib/friend-activity"

export type InboxNotificationType =
  | "activity_reaction"
  | "activity_reply"
  | "comment_reply"
  | "composer_attribution_added"
  | "composer_tune_started_practice"
  | "direct_message"
  | "learning_list_shared"
  | "piece_edit_request_approved"
  | "piece_edit_request_rejected"
  | "setlist_invite"
  | "setlist_invite_accepted"
  | "setlist_tune_added"
  | "setlist_tune_removed"
  | "setlist_item_updated"
  | "setlist_details_updated"
  | "badge_awarded"

type NotificationRow = {
  id: number
  recipient_user_id: string
  actor_user_id: string
  notification_type: InboxNotificationType
  activity_event_id: number | null
  activity_reaction_id: number | null
  activity_reply_id: number | null
  direct_message_id: number | null
  piece_id: number | null
  learning_list_id: number | null
  setlist_id: number | null
  setlist_item_id: number | null
  comment_id: number | null
  badge_id: number | null
  body_preview: string | null
  read_at: string | null
  created_at: string
}

type ProfileRow = {
  id: string
  username: string | null
  display_name: string | null
}

type PieceRow = {
  id: number
  title: string
}

type LearningListRow = {
  id: number
  name: string
}

type SetlistRow = {
  id: number
  name: string
}

type BadgeRow = {
  id: number
  name: string
  slug: string
}

type DirectMessageRow = {
  id: number
  body: string
  sender_user_id: string
  recipient_user_id: string
  created_at: string
  read_at: string | null
}

type ActivityEventRow = {
  id: number
  event_type: string
  piece_id: number | null
  learning_list_id: number | null
  metadata: Record<string, unknown> | null
}

export type InboxItem = {
  id: number
  notification_type: InboxNotificationType
  created_at: string
  read_at: string | null
  body_preview: string | null
  actor: {
    id: string
    username: string | null
    display_name: string | null
  } | null
  piece: {
    id: number
    title: string
  } | null
  learning_list: {
    id: number
    name: string
  } | null
  setlist: {
    id: number
    name: string
  } | null
  badge: {
    id: number
    name: string
    slug: string
  } | null
  direct_message: {
    id: number
    body: string
  } | null
  activity_context: {
    summary: string
    href: string | null
  } | null
}

export type DirectMessageThreadMessage = {
  id: number
  body: string
  sender_user_id: string
  recipient_user_id: string
  created_at: string
  read_at: string | null
  isOutgoing: boolean
}

export type DirectMessageThread = {
  otherUser: {
    id: string
    username: string | null
    display_name: string | null
  }
  messages: DirectMessageThreadMessage[]
  latestMessageAt: string
  unreadCount: number
}

function profileLabel(profile: ProfileRow | null | undefined) {
  return profile?.display_name || profile?.username || "Unknown player"
}

export async function loadInboxData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [
    { data: notifications, error: notificationsError },
    { data: directMessages, error: directMessagesError },
  ] = await Promise.all([
    supabase
      .from("user_notifications")
      .select(
        `
          id,
          recipient_user_id,
          actor_user_id,
          notification_type,
          activity_event_id,
          activity_reaction_id,
          activity_reply_id,
          direct_message_id,
          piece_id,
          learning_list_id,
          setlist_id,
          setlist_item_id,
          comment_id,
          badge_id,
          body_preview,
          read_at,
          created_at
        `
      )
      .eq("recipient_user_id", user.id)
      .neq("notification_type", "direct_message")
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("direct_messages")
      .select("id, body, sender_user_id, recipient_user_id, created_at, read_at")
      .or(
        `and(sender_user_id.eq.${user.id},sender_archived_at.is.null),and(recipient_user_id.eq.${user.id},recipient_archived_at.is.null)`
      )
      .order("created_at", { ascending: true })
      .limit(300),
  ])

  if (notificationsError) {
    throw new Error(notificationsError.message)
  }

  if (directMessagesError) {
    throw new Error(directMessagesError.message)
  }

  const typedNotifications = (notifications ?? []) as NotificationRow[]
  const typedDirectMessages = (directMessages ?? []) as DirectMessageRow[]

  const actorIds = Array.from(
    new Set(typedNotifications.map((notification) => notification.actor_user_id))
  )

  const pieceIds = Array.from(
    new Set(
      typedNotifications
        .map((notification) => notification.piece_id)
        .filter((value): value is number => value !== null)
    )
  )

  const activityEventIds = Array.from(
    new Set(
      typedNotifications
        .map((notification) => notification.activity_event_id)
        .filter((value): value is number => value !== null)
    )
  )

  let activityEventsById = new Map<number, ActivityEventRow>()

  if (activityEventIds.length > 0) {
    const { data: activityEvents, error: activityEventsError } = await supabase
      .from("user_activity_events")
      .select("id, event_type, piece_id, learning_list_id, metadata")
      .in("id", activityEventIds)

    if (activityEventsError) {
      throw new Error(activityEventsError.message)
    }

    activityEventsById = new Map(
      ((activityEvents ?? []) as ActivityEventRow[]).map((event) => [
        event.id,
        event,
      ])
    )
  }

  const activityPieceIds = Array.from(
    new Set(
      Array.from(activityEventsById.values())
        .map((event) => event.piece_id)
        .filter((value): value is number => value !== null)
    )
  )

  const activityLearningListIds = Array.from(
    new Set(
      Array.from(activityEventsById.values())
        .map((event) => event.learning_list_id)
        .filter((value): value is number => value !== null)
    )
  )

  const learningListIds = Array.from(
    new Set(
      typedNotifications
        .map((notification) => notification.learning_list_id)
        .filter((value): value is number => value !== null)
    )
  )

  const setlistIds = Array.from(
    new Set(
      typedNotifications
        .map((notification) => notification.setlist_id)
        .filter((value): value is number => value !== null)
    )
  )

  const badgeIds = Array.from(
    new Set(
      typedNotifications
        .map((notification) => notification.badge_id)
        .filter((value): value is number => value !== null)
    )
  )

  const directMessageParticipantIds = Array.from(
    new Set(
      typedDirectMessages.map((message) =>
        message.sender_user_id === user.id
          ? message.recipient_user_id
          : message.sender_user_id
      )
    )
  )

  const profileIds = Array.from(
    new Set([...actorIds, ...directMessageParticipantIds])
  )

  let profilesById = new Map<string, ProfileRow>()
  let piecesById = new Map<number, PieceRow>()
  let learningListsById = new Map<number, LearningListRow>()
  let setlistsById = new Map<number, SetlistRow>()
  let badgesById = new Map<number, BadgeRow>()

  const allPieceIds = Array.from(new Set([...pieceIds, ...activityPieceIds]))
  const allLearningListIds = Array.from(
    new Set([...learningListIds, ...activityLearningListIds])
  )

  ;[
    profilesById,
    piecesById,
    learningListsById,
    setlistsById,
    badgesById,
  ] = await Promise.all([
    profileIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, username, display_name")
          .in("id", profileIds)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as ProfileRow[]).map((profile) => [
                profile.id,
                profile,
              ])
            )
          })
      : Promise.resolve(new Map<string, ProfileRow>()),

    allPieceIds.length > 0
      ? supabase
          .from("pieces")
          .select("id, title")
          .in("id", allPieceIds)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as PieceRow[]).map((piece) => [piece.id, piece])
            )
          })
      : Promise.resolve(new Map<number, PieceRow>()),

    allLearningListIds.length > 0
      ? supabase
          .from("learning_lists")
          .select("id, name")
          .in("id", allLearningListIds)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as LearningListRow[]).map((list) => [
                list.id,
                list,
              ])
            )
          })
      : Promise.resolve(new Map<number, LearningListRow>()),

    setlistIds.length > 0
      ? supabase
          .from("setlists")
          .select("id, name")
          .in("id", setlistIds)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as SetlistRow[]).map((setlist) => [
                setlist.id,
                setlist,
              ])
            )
          })
      : Promise.resolve(new Map<number, SetlistRow>()),

    badgeIds.length > 0
      ? supabase
          .from("badges")
          .select("id, name, slug")
          .in("id", badgeIds)
          .then(({ data, error }) => {
            if (error) throw new Error(error.message)
            return new Map(
              ((data ?? []) as BadgeRow[]).map((badge) => [badge.id, badge])
            )
          })
      : Promise.resolve(new Map<number, BadgeRow>()),
  ])

  const notificationItems: InboxItem[] = typedNotifications.map(
    (notification) => {
      const actor = profilesById.get(notification.actor_user_id) ?? null

      const piece =
        notification.piece_id != null
          ? piecesById.get(notification.piece_id) ?? null
          : null

      const learningList =
        notification.learning_list_id != null
          ? learningListsById.get(notification.learning_list_id) ?? null
          : null

      const setlist =
        notification.setlist_id != null
          ? setlistsById.get(notification.setlist_id) ?? null
          : null

      const badge =
        notification.badge_id != null
          ? badgesById.get(notification.badge_id) ?? null
          : null

      const activityEvent =
        notification.activity_event_id != null
          ? activityEventsById.get(notification.activity_event_id) ?? null
          : null
      const activityPiece =
        activityEvent?.piece_id != null
          ? piecesById.get(activityEvent.piece_id) ?? null
          : null
      const activityLearningList =
        activityEvent?.learning_list_id != null
          ? learningListsById.get(activityEvent.learning_list_id) ?? null
          : null
      const activityHref = activityPiece
        ? `/library/${activityPiece.id}`
        : activityLearningList
          ? `/public-lists/${activityLearningList.id}`
          : null
      const activityContext = activityEvent
        ? {
            summary: getActivitySummaryText({
              event_type: activityEvent.event_type,
              metadata: activityEvent.metadata,
              piece: activityPiece,
              learning_list: activityLearningList,
            }),
            href: activityHref,
          }
        : null

      return {
        id: notification.id,
        notification_type: notification.notification_type,
        created_at: notification.created_at,
        read_at: notification.read_at,
        body_preview: notification.body_preview,
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
        setlist: setlist
          ? {
              id: setlist.id,
              name: setlist.name,
            }
          : null,
        badge: badge
          ? {
              id: badge.id,
              name: badge.name,
              slug: badge.slug,
            }
          : null,
        direct_message: null,
        activity_context: activityContext,
      }
    }
  )

  const threadMap = new Map<string, DirectMessageThread>()

  for (const message of typedDirectMessages) {
    const otherUserId =
      message.sender_user_id === user.id
        ? message.recipient_user_id
        : message.sender_user_id

    const profile = profilesById.get(otherUserId) ?? {
      id: otherUserId,
      username: null,
      display_name: null,
    }

    const existingThread =
      threadMap.get(otherUserId) ??
      ({
        otherUser: {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name ?? profileLabel(profile),
        },
        messages: [],
        latestMessageAt: message.created_at,
        unreadCount: 0,
      } satisfies DirectMessageThread)

    const isOutgoing = message.sender_user_id === user.id
    const isUnreadIncoming = !isOutgoing && message.read_at === null

    existingThread.messages.push({
      id: message.id,
      body: message.body,
      sender_user_id: message.sender_user_id,
      recipient_user_id: message.recipient_user_id,
      created_at: message.created_at,
      read_at: message.read_at,
      isOutgoing,
    })

    existingThread.latestMessageAt = message.created_at

    if (isUnreadIncoming) {
      existingThread.unreadCount += 1
    }

    threadMap.set(otherUserId, existingThread)
  }

  const messageThreads = Array.from(threadMap.values()).sort(
    (a, b) =>
      new Date(b.latestMessageAt).getTime() -
      new Date(a.latestMessageAt).getTime()
  )

  const unreadNotificationCount = notificationItems.filter(
    (item) => item.read_at === null
  ).length

  const unreadMessageCount = messageThreads.reduce(
    (sum, thread) => sum + thread.unreadCount,
    0
  )

  return {
    user,
    notificationItems,
    messageThreads,
    unreadNotificationCount,
    unreadMessageCount,
    unreadCount: unreadNotificationCount + unreadMessageCount,
  }
}

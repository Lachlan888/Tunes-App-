import Link from "next/link"
import type { BadgeCategory } from "@/lib/types"

export type ActivityEventType =
  | "started_practice"
  | "tune_reviewed"
  | "marked_known"
  | "comment_added"
  | "public_list_created"
  | "public_list_updated"
  | "piece_created"
  | "piece_details_added"
  | "piece_lore_added"
  | "piece_media_link_added"
  | "piece_sheet_music_link_added"
  | "badge_created"
  | "badge_awarded"

export type ActivityReactionSummary = {
  reaction_type: string
  count: number
  user_has_reacted: boolean
}

export type ActivityReplyItem = {
  id: number
  body: string
  created_at: string
  author: {
    id: string
    username: string | null
    display_name: string | null
  } | null
}

export type FriendActivityProfile = {
  id: string
  username: string | null
  display_name: string | null
}

export type FriendActivityItem = {
  id: number
  activity_key: string
  is_interactable: boolean
  created_at: string
  event_type: ActivityEventType
  metadata: Record<string, unknown> | null
  actor: FriendActivityProfile | null
  piece: {
    id: number
    title: string
  } | null
  learning_list: {
    id: number
    name: string
  } | null
  comment: {
    id: number
    body: string
  } | null
  badge: {
    id: number
    name: string
    slug: string
    category: BadgeCategory
    description: string | null
    owner_user_id: string
  } | null
  awarded_by_profile: FriendActivityProfile | null
  reactions: ActivityReactionSummary[]
  replies: ActivityReplyItem[]
}

export const ACTIVITY_REACTION_LABELS: Record<string, string> = {
  good_craic: "Good craic!",
}

export function formatFriendActivityRelativeTime(createdAt: string) {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours} hr ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  }

  return new Date(createdAt).toLocaleDateString("en-AU")
}

function renderCommentExcerpt(body: string) {
  const cleanedBody = body.replace(/\s+/g, " ").trim()
  const excerpt =
    cleanedBody.length > 180
      ? `${cleanedBody.slice(0, 180).trim()}…`
      : cleanedBody

  return (
    <span className="mt-2 block border-l-2 border-border pl-3 text-muted-foreground">
      “{excerpt}”
    </span>
  )
}

function getMetadataFields(metadata: Record<string, unknown> | null) {
  const rawFields = metadata?.fields

  if (!Array.isArray(rawFields)) {
    return []
  }

  return rawFields.filter((field): field is string => typeof field === "string")
}

function humanisePieceDetailField(field: string) {
  if (field === "time_signature") return "time signature"
  if (field === "reference_url") return "reference link"
  return field.replace(/_/g, " ")
}

function renderAddedFields(metadata: Record<string, unknown> | null) {
  const fields = getMetadataFields(metadata).map(humanisePieceDetailField)

  if (fields.length === 0) {
    return "missing details"
  }

  if (fields.length === 1) {
    return fields[0]
  }

  if (fields.length === 2) {
    return `${fields[0]} and ${fields[1]}`
  }

  return `${fields.slice(0, -1).join(", ")}, and ${fields[fields.length - 1]}`
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getActivityContextHref(item: FriendActivityItem) {
  if (item.badge) {
    return `/badges/${item.badge.slug}`
  }

  if (item.piece) {
    return `/library/${item.piece.id}`
  }

  if (item.learning_list) {
    return `/public-lists/${item.learning_list.id}`
  }

  return "/friends"
}

function renderProfileLink(profile: FriendActivityProfile | null) {
  const profileName = profile?.display_name || profile?.username || "Unnamed user"

  return profile?.username ? (
    <Link
      href={`/users/${profile.username}`}
      className="font-medium underline underline-offset-4 hover:text-primary"
    >
      {profileName}
    </Link>
  ) : (
    <span>{profileName}</span>
  )
}

function renderActor(item: FriendActivityItem) {
  return renderProfileLink(item.actor)
}

function renderPieceLink(item: FriendActivityItem) {
  if (!item.piece) return null

  return (
    <Link
      href={`/library/${item.piece.id}`}
      className="font-medium underline underline-offset-4 hover:text-primary"
    >
      {item.piece.title}
    </Link>
  )
}

function renderBadgeLink(item: FriendActivityItem) {
  if (!item.badge) return null

  return (
    <Link
      href={`/badges/${item.badge.slug}`}
      className="font-medium underline underline-offset-4 hover:text-primary"
    >
      {item.badge.name}
    </Link>
  )
}

export function renderFriendActivityText(item: FriendActivityItem) {
  const actorNode = renderActor(item)
  const pieceNode = renderPieceLink(item)
  const badgeNode = renderBadgeLink(item)

  if (item.event_type === "started_practice" && pieceNode) {
    return (
      <>
        {actorNode} started practising {pieceNode}
      </>
    )
  }

  if (item.event_type === "tune_reviewed" && pieceNode) {
    return (
      <>
        {actorNode} practised {pieceNode}
      </>
    )
  }

  if (item.event_type === "marked_known" && pieceNode) {
    return (
      <>
        {actorNode} marked {pieceNode} as known
      </>
    )
  }

  if (item.event_type === "comment_added" && pieceNode) {
    return (
      <>
        {actorNode} commented on {pieceNode}
        {item.comment?.body ? renderCommentExcerpt(item.comment.body) : null}
      </>
    )
  }

  if (item.event_type === "piece_created" && pieceNode) {
    return (
      <>
        {actorNode} added a new tune: {pieceNode}
      </>
    )
  }

  if (item.event_type === "piece_details_added" && pieceNode) {
    return (
      <>
        {actorNode} added {renderAddedFields(item.metadata)} to {pieceNode}
      </>
    )
  }

  if (item.event_type === "piece_lore_added" && pieceNode) {
    return (
      <>
        {actorNode} added lore to {pieceNode}
      </>
    )
  }

  if (item.event_type === "piece_media_link_added" && pieceNode) {
    return (
      <>
        {actorNode} added a reference link for {pieceNode}
      </>
    )
  }

  if (item.event_type === "piece_sheet_music_link_added" && pieceNode) {
    return (
      <>
        {actorNode} added sheet music for {pieceNode}
      </>
    )
  }

  if (item.event_type === "public_list_created" && item.learning_list) {
    return (
      <>
        {actorNode} created a public list:{" "}
        <Link
          href={`/public-lists/${item.learning_list.id}`}
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          {item.learning_list.name}
        </Link>
      </>
    )
  }

  if (item.event_type === "public_list_updated" && item.learning_list) {
    return (
      <>
        {actorNode} updated the public list{" "}
        <Link
          href={`/public-lists/${item.learning_list.id}`}
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          {item.learning_list.name}
        </Link>
      </>
    )
  }

  if (item.event_type === "badge_created" && badgeNode && item.badge) {
    return (
      <>
        {actorNode} created the {titleCase(item.badge.category)} badge {badgeNode}
      </>
    )
  }

  if (item.event_type === "badge_awarded" && badgeNode) {
    const awarderNode = renderProfileLink(item.awarded_by_profile)

    return (
      <>
        {actorNode} received the badge {badgeNode} from {awarderNode}
      </>
    )
  }

  return <>{actorNode} did something</>
}
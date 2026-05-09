import Link from "next/link"

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

export type FriendActivityItem = {
  id: number
  created_at: string
  event_type: ActivityEventType
  metadata: Record<string, unknown> | null
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
  comment: {
    id: number
    body: string
  } | null
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

export function getActivityContextHref(item: FriendActivityItem) {
  if (item.piece) {
    return `/library/${item.piece.id}`
  }

  if (item.learning_list) {
    return `/public-lists/${item.learning_list.id}`
  }

  return "/friends"
}

function renderActor(item: FriendActivityItem) {
  const actorName =
    item.actor?.display_name || item.actor?.username || "Unnamed user"

  return item.actor?.username ? (
    <Link
      href={`/users/${item.actor.username}`}
      className="font-medium underline underline-offset-4 hover:text-primary"
    >
      {actorName}
    </Link>
  ) : (
    <span>{actorName}</span>
  )
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

export function renderFriendActivityText(item: FriendActivityItem) {
  const actorNode = renderActor(item)
  const pieceNode = renderPieceLink(item)

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

  return <>{actorNode} did something</>
}
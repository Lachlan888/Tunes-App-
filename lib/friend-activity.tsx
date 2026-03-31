import Link from "next/link"

export type FriendActivityItem = {
  id: number
  created_at: string
  event_type:
    | "started_practice"
    | "tune_reviewed"
    | "marked_known"
    | "comment_added"
    | "public_list_created"
    | "public_list_updated"
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

export function renderFriendActivityText(item: FriendActivityItem) {
  const actorName =
    item.actor?.display_name || item.actor?.username || "Unnamed user"

  const actorNode =
    item.actor?.username ? (
      <Link href={`/users/${item.actor.username}`} className="underline">
        {actorName}
      </Link>
    ) : (
      <span>{actorName}</span>
    )

  if (item.event_type === "started_practice" && item.piece) {
    return (
      <>
        {actorNode} started practising{" "}
        <Link href={`/library/${item.piece.id}`} className="underline">
          {item.piece.title}
        </Link>
      </>
    )
  }

  if (item.event_type === "tune_reviewed" && item.piece) {
    return (
      <>
        {actorNode} practised{" "}
        <Link href={`/library/${item.piece.id}`} className="underline">
          {item.piece.title}
        </Link>
      </>
    )
  }

  if (item.event_type === "marked_known" && item.piece) {
    return (
      <>
        {actorNode} marked{" "}
        <Link href={`/library/${item.piece.id}`} className="underline">
          {item.piece.title}
        </Link>{" "}
        as known
      </>
    )
  }

  if (item.event_type === "comment_added" && item.piece) {
    return (
      <>
        {actorNode} commented on{" "}
        <Link href={`/library/${item.piece.id}`} className="underline">
          {item.piece.title}
        </Link>
      </>
    )
  }

  if (item.event_type === "public_list_created" && item.learning_list) {
    return (
      <>
        {actorNode} created a public list:{" "}
        <Link
          href={`/public-lists/${item.learning_list.id}`}
          className="underline"
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
          className="underline"
        >
          {item.learning_list.name}
        </Link>
      </>
    )
  }

  return <>{actorNode} did something</>
}
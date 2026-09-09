import type { Setlist, SetlistItemWithCoverage, SetlistMember } from "@/lib/types"

export type SetlistMode = "read" | "manage" | "performance"

export type ActiveSetlistPayload = {
  version: 1
  setlist: {
    id: number
    name: string
    eventDate: string | null
    location: string | null
    updatedAt: string | null
  }
  items: Array<{
    id: number
    pieceId: number
    position: number
    title: string
    key: string | null
    type: string | null
    note: string | null
  }>
}

export function parseSetlistMode(value: string | undefined): SetlistMode {
  return value === "manage" || value === "performance" ? value : "read"
}

export function buildPersonalReadiness(
  items: SetlistItemWithCoverage[],
  currentUserId: string
) {
  let known = 0
  let practice = 0
  let newToMe = 0

  for (const item of items) {
    const ownState = item.coverage.find((row) => row.user_id === currentUserId)
    if (ownState?.status === "known") known += 1
    else if (ownState?.status === "practice") practice += 1
    else newToMe += 1
  }

  return { total: items.length, known, practice, newToMe }
}

export function buildActiveSetlistPayload({
  setlist,
  items,
}: {
  setlist: Setlist
  items: SetlistItemWithCoverage[]
}): ActiveSetlistPayload {
  return {
    version: 1,
    setlist: {
      id: setlist.id,
      name: setlist.name,
      eventDate: setlist.event_date,
      location: setlist.location,
      updatedAt: setlist.updated_at,
    },
    items: items.map((item) => ({
      id: item.id,
      pieceId: item.piece_id,
      position: item.position,
      title: item.piece?.title ?? "Untitled tune",
      key: item.performance_key ?? item.piece?.key ?? null,
      type: item.piece?.type ?? item.piece?.style ?? null,
      note: item.notes?.trim() ? item.notes.trim().slice(0, 240) : null,
    })),
  }
}

export function setlistMemberInitials(member: SetlistMember) {
  const label = member.profile?.display_name || member.profile?.username || "?"
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"
}

import { getPrimaryStyleLabel } from "@/lib/search-filters"
import { getToday, normaliseStoredDate } from "@/lib/review"
import type { Piece } from "@/lib/types"

export type KnownTuneGrouping = "none" | "key" | "style"
export type PracticeTuneGrouping =
  | KnownTuneGrouping
  | "due"
  | "stage"

export function getKnownTuneGroupLabel(
  piece: Piece,
  grouping: KnownTuneGrouping
) {
  if (grouping === "key") return piece.key ? `Key ${piece.key}` : "Key unknown"
  if (grouping === "style") return getPrimaryStyleLabel(piece) ?? "Style unknown"
  return "Tunes"
}

export function getPracticeTuneGroupLabel(
  item: { piece: Piece; stage?: number | null; next_review_due?: string | null },
  grouping: PracticeTuneGrouping,
  today = getToday()
) {
  if (grouping === "stage") {
    return item.stage ? `Stage ${item.stage}` : "Stage unknown"
  }

  if (grouping === "due") {
    const dueDate = normaliseStoredDate(item.next_review_due)
    if (!dueDate) return "No due date"
    if (dueDate < today) return "Overdue"
    if (dueDate === today) return "Due today"
    return "Upcoming"
  }

  return getKnownTuneGroupLabel(item.piece, grouping)
}

const DUE_GROUP_ORDER = ["Overdue", "Due today", "Upcoming", "No due date"]

export function compareTuneGroupLabels(
  first: string,
  second: string,
  grouping: PracticeTuneGrouping
) {
  if (grouping === "due") {
    return DUE_GROUP_ORDER.indexOf(first) - DUE_GROUP_ORDER.indexOf(second)
  }
  if (grouping === "stage") {
    const firstStage = Number(first.replace("Stage ", "")) || Number.MAX_SAFE_INTEGER
    const secondStage = Number(second.replace("Stage ", "")) || Number.MAX_SAFE_INTEGER
    return firstStage - secondStage
  }
  return first.localeCompare(second, undefined, { numeric: true })
}

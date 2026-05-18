import type { Piece } from "@/lib/types"
import type {
  PracticeDayRelation,
  PracticeNoteCategoryRelation,
  ReviewQueueItem,
} from "./types"

export function getPiece(pieces: Piece[] | Piece | null): Piece | null {
  if (!pieces) return null
  return Array.isArray(pieces) ? pieces[0] ?? null : pieces
}

export function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export function getPracticeNoteCategoryName(
  relation: PracticeNoteCategoryRelation
): string | null {
  return getSingleJoinedRow(relation)?.name ?? null
}

export function getPracticeDayDate(relation: PracticeDayRelation): string | null {
  return getSingleJoinedRow(relation)?.practice_date ?? null
}

export function sortByDueDateAscending(
  a: ReviewQueueItem,
  b: ReviewQueueItem
) {
  const aDue = a.due_date_only ?? "9999-12-31"
  const bDue = b.due_date_only ?? "9999-12-31"

  if (aDue !== bDue) {
    return aDue.localeCompare(bDue)
  }

  return a.stage - b.stage
}

export function sortByMostOverdueFirst(
  a: ReviewQueueItem,
  b: ReviewQueueItem
) {
  if (a.overdue_days !== b.overdue_days) {
    return b.overdue_days - a.overdue_days
  }

  const aDue = a.due_date_only ?? "9999-12-31"
  const bDue = b.due_date_only ?? "9999-12-31"

  if (aDue !== bDue) {
    return aDue.localeCompare(bDue)
  }

  return a.stage - b.stage
}
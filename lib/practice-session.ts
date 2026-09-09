import {
  getNextStageForFailed,
  getNextStageForShaky,
  getNextStageForSolid,
} from "./review.ts"

export type PracticeLane = "due-today" | "catch-up" | "list" | "focus"
export type PracticeRating = "failed" | "shaky" | "solid"
export type PracticeRatingState = "idle" | "undo-window" | "submitting"

export type PracticeSessionResult = {
  userPieceId: number
  pieceId: number
  title: string
  outcome: PracticeRating
  previousStage: number
  resultingStage: number
  movedToKnown: boolean
}

export function getPracticeSessionHref(lane: PracticeLane) {
  return `/review?session=${lane}`
}

export function parsePracticeLane(value: string | undefined): PracticeLane | null {
  return value === "due-today" || value === "catch-up" || value === "list" || value === "focus"
    ? value
    : null
}

export function getResultingPracticeStage(
  stage: number,
  outcome: PracticeRating
) {
  if (outcome === "solid") return getNextStageForSolid(stage)
  if (outcome === "shaky") return getNextStageForShaky(stage)
  return getNextStageForFailed(stage)
}

export function getPracticeResultCounts(results: PracticeSessionResult[]) {
  return results.reduce(
    (counts, result) => ({
      ...counts,
      [result.outcome]: counts[result.outcome] + 1,
    }),
    { failed: 0, shaky: 0, solid: 0 }
  )
}

export function getPracticeSessionSuggestion(results: PracticeSessionResult[]) {
  const counts = getPracticeResultCounts(results)

  if (counts.failed > 0) {
    return "Revisit the Rough tunes in a short focused session before adding more material."
  }

  if (counts.shaky > 0) {
    return "A quick pass through the Shaky tunes will help settle them before the next review."
  }

  if (counts.solid > 0) {
    return "That was a strong run. Your learning queue is a good place to choose what comes next."
  }

  return "Choose another lane or return when a tune is ready for review."
}

export function canBeginPracticeRating(state: PracticeRatingState) {
  return state === "idle"
}

export function canUndoPracticeRating(state: PracticeRatingState) {
  return state === "undo-window"
}

export function removeRatedPracticeItem<T extends { id: number }>(
  queue: T[],
  userPieceId: number,
  currentIndex: number
) {
  const nextQueue = queue.filter((item) => item.id !== userPieceId)
  return {
    queue: nextQueue,
    index: Math.min(currentIndex, Math.max(0, nextQueue.length - 1)),
  }
}

export function clampPracticeSessionPosition(position: number, itemCount: number) {
  if (!Number.isInteger(position) || position < 0) return 0
  return Math.min(position, Math.max(0, itemCount - 1))
}

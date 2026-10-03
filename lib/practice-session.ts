import {
  getNextStageForFailed,
  getNextStageForShaky,
  getNextStageForSolid,
} from "./review.ts"

export type PracticeLane = "due-today" | "catch-up" | "list" | "focus"
export type PracticeRating = "failed" | "shaky" | "solid"
export type PracticeRatingState = "idle" | "undo-window" | "submitting"

export const ACTIVE_PRACTICE_SESSION_KEY = "tunes.session.v1.practice.active"

export type ActivePracticeSession = {
  href: string
  lane: PracticeLane
  sessionDate: string
}

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

export function getPracticeReflectionHref(
  sessionDate: string,
  returnTo = "/"
) {
  const params = new URLSearchParams({
    date: /^\d{4}-\d{2}-\d{2}$/.test(sessionDate) ? sessionDate : "",
    from: "session",
    return_to: getSafePracticeReturnHref(returnTo),
  })

  if (!params.get("date")) params.delete("date")
  return `/review/diary?${params.toString()}`
}

export function getSafePracticeReturnHref(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/"

  try {
    const url = new URL(value, "https://tunes.invalid")
    if (url.origin !== "https://tunes.invalid") return "/"
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return "/"
  }
}

export function parsePracticeLane(value: string | undefined): PracticeLane | null {
  return value === "due-today" || value === "catch-up" || value === "list" || value === "focus"
    ? value
    : null
}

export function getResumablePracticeHref(
  storedValue: string | null,
  today: string
) {
  if (!storedValue) return null

  try {
    const session = JSON.parse(storedValue) as Partial<ActivePracticeSession>
    if (session.sessionDate !== today || !session.href || !session.lane) return null

    const url = new URL(session.href, "https://tunes.invalid")
    if (url.pathname !== "/review") return null

    const lane = parsePracticeLane(url.searchParams.get("session") ?? undefined)
    if (lane !== session.lane) return null

    if (lane === "list" || lane === "focus") {
      const idParam = lane === "list" ? "list_id" : "focus_id"
      const id = Number(url.searchParams.get(idParam))
      if (!Number.isSafeInteger(id) || id <= 0) return null
    }

    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
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

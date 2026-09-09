export type RepertoireState = {
  known: boolean
  practiceStage: number | null
}

export type ComparedTuneState = {
  pieceId: number
  byUserId: Record<string, RepertoireState>
}

export type CompareOutcomeGroups = {
  playableTogetherIds: number[]
  sharedStrongIds: number[]
  sharedShakyIds: number[]
  teachableByUserId: Record<string, number[]>
  suggestedSetIds: number[]
}

export function deriveCompareOutcomeGroups(
  participantIds: string[],
  tuneStates: ComparedTuneState[],
  suggestedSetSize = 6
): CompareOutcomeGroups {
  const playableTogetherIds: number[] = []
  const sharedStrongIds: number[] = []
  const sharedShakyIds: number[] = []
  const teachableByUserId = Object.fromEntries(
    participantIds.map((userId) => [userId, [] as number[]])
  )

  for (const tune of tuneStates) {
    const states = participantIds.map(
      (userId) => tune.byUserId[userId] ?? { known: false, practiceStage: null }
    )
    const allPlay = states.every(
      (state) => state.known || state.practiceStage !== null
    )

    if (allPlay) {
      playableTogetherIds.push(tune.pieceId)
      const allStrong = states.every(
        (state) => state.known || (state.practiceStage ?? 0) >= 5
      )
      ;(allStrong ? sharedStrongIds : sharedShakyIds).push(tune.pieceId)
      continue
    }

    if (participantIds.length === 2) {
      participantIds.forEach((userId, index) => {
        const other = states[index === 0 ? 1 : 0]
        if (states[index].known && !other.known && other.practiceStage === null) {
          teachableByUserId[userId].push(tune.pieceId)
        }
      })
    }
  }

  return {
    playableTogetherIds,
    sharedStrongIds,
    sharedShakyIds,
    teachableByUserId,
    suggestedSetIds: [...sharedStrongIds, ...sharedShakyIds].slice(
      0,
      suggestedSetSize
    ),
  }
}

export function parseComparePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return Math.min(parsed, 50)
}

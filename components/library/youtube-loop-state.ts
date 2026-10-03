export type LoopPlaybackState = {
  currentTime: number
  isPlaying: boolean
  playbackRate: number
  loopStart: number | null
  loopEnd: number | null
  loopEnabled: boolean
}

export const MINIMUM_LOOP_LENGTH = 0.2

export const LOOP_BANK_KEYS = ["A", "B", "C", "D"] as const

export type LoopBankKey = (typeof LOOP_BANK_KEYS)[number]

export type LoopBankState = {
  key: LoopBankKey
  savedLoopId: number | null
  name: string
  startSeconds: number | null
  endSeconds: number | null
  playbackRate: number
  dirty: boolean
}

export type BankLoop = {
  id: number
  label: string
  start_seconds: number | string
  end_seconds: number | string
  playback_rate: number | string
}

export function loadSavedLoopIntoBank(
  banks: LoopBankState[],
  bankIndex: number,
  loop: BankLoop
): LoopBankState[] {
  return banks.map((bank, index) =>
    index === bankIndex
      ? {
          ...bank,
          savedLoopId: loop.id,
          name: loop.label,
          startSeconds: Number(loop.start_seconds),
          endSeconds: Number(loop.end_seconds),
          playbackRate: Number(loop.playback_rate) || 1,
          dirty: false,
        }
      : bank
  )
}

export function createLoopBanks(loops: BankLoop[]): LoopBankState[] {
  return LOOP_BANK_KEYS.map((key, index) => {
    const loop = loops[index]
    if (!loop) {
      return {
        key,
        savedLoopId: null,
        name: "Empty",
        startSeconds: null,
        endSeconds: null,
        playbackRate: 1,
        dirty: false,
      }
    }

    return {
      key,
      savedLoopId: loop.id,
      name: loop.label,
      startSeconds: Number(loop.start_seconds),
      endSeconds: Number(loop.end_seconds),
      playbackRate: Number(loop.playback_rate) || 1,
      dirty: false,
    }
  })
}

export function startNewSectionDraft(
  state: LoopPlaybackState
): LoopPlaybackState {
  return {
    ...state,
    loopStart: 0,
    loopEnd: null,
    loopEnabled: false,
  }
}

export function setLoopStartAtPlayhead(
  state: LoopPlaybackState
): LoopPlaybackState {
  const keepsExistingEnd =
    state.loopEnd !== null &&
    state.loopEnd > state.currentTime + MINIMUM_LOOP_LENGTH

  return {
    ...state,
    loopStart: state.currentTime,
    loopEnd: keepsExistingEnd ? state.loopEnd : null,
    loopEnabled: keepsExistingEnd ? state.loopEnabled : false,
  }
}

export function setLoopEndAtPlayhead(state: LoopPlaybackState):
  | { ok: true; state: LoopPlaybackState }
  | { ok: false; error: string } {
  if (
    state.loopStart === null ||
    state.currentTime <= state.loopStart + MINIMUM_LOOP_LENGTH
  ) {
    return { ok: false, error: "Set the end after the loop start." }
  }

  return {
    ok: true,
    state: {
      ...state,
      loopEnd: state.currentTime,
      loopEnabled: true,
    },
  }
}

export function selectSavedLoopWindow(
  state: LoopPlaybackState,
  loop: {
    startSeconds: number
    endSeconds: number
    playbackRate: number
  }
): LoopPlaybackState | null {
  if (
    !Number.isFinite(loop.startSeconds) ||
    !Number.isFinite(loop.endSeconds) ||
    loop.endSeconds <= loop.startSeconds
  ) {
    return null
  }

  return {
    ...state,
    loopStart: loop.startSeconds,
    loopEnd: loop.endSeconds,
    loopEnabled: true,
    playbackRate:
      Number.isFinite(loop.playbackRate) && loop.playbackRate > 0
        ? loop.playbackRate
        : state.playbackRate,
  }
}

function clampTime(value: number, mediaDuration: number) {
  const nonNegative = Math.max(value, 0)
  return mediaDuration > 0
    ? Math.min(nonNegative, mediaDuration)
    : nonNegative
}

export function nudgeLoopBoundary(
  state: LoopPlaybackState,
  boundary: "start" | "end",
  amount: number,
  mediaDuration: number
): LoopPlaybackState {
  if (boundary === "start" && state.loopStart !== null) {
    const maximumStart =
      state.loopEnd !== null
        ? state.loopEnd - MINIMUM_LOOP_LENGTH
        : mediaDuration || Infinity

    return {
      ...state,
      loopStart: Math.min(
        clampTime(state.loopStart + amount, mediaDuration),
        maximumStart
      ),
    }
  }

  if (
    boundary === "end" &&
    state.loopStart !== null &&
    state.loopEnd !== null
  ) {
    return {
      ...state,
      loopEnd: Math.max(
        clampTime(state.loopEnd + amount, mediaDuration),
        state.loopStart + MINIMUM_LOOP_LENGTH
      ),
    }
  }

  return state
}

export function resizeLoopWindow(
  state: LoopPlaybackState,
  operation: "halve" | "double",
  mediaDuration: number
): LoopPlaybackState {
  if (state.loopStart === null || state.loopEnd === null) return state

  const currentLength = state.loopEnd - state.loopStart
  const multiplier = operation === "halve" ? 0.5 : 2

  return {
    ...state,
    loopEnd: clampTime(
      state.loopStart + currentLength * multiplier,
      mediaDuration
    ),
  }
}

export function shiftLoopWindow(
  state: LoopPlaybackState,
  direction: "previous" | "next",
  mediaDuration: number
): LoopPlaybackState | null {
  const { loopStart, loopEnd } = state
  if (
    loopStart === null || loopEnd === null ||
    !Number.isFinite(loopStart) || !Number.isFinite(loopEnd) ||
    loopStart < 0 || !Number.isFinite(mediaDuration) ||
    (mediaDuration > 0 && loopEnd > mediaDuration)
  ) return null

  const loopLength = loopEnd - loopStart
  if (loopLength <= MINIMUM_LOOP_LENGTH) return null

  if (direction === "previous") {
    if (loopStart === 0) return null
    const nextStart = Math.max(0, loopStart - loopLength)
    return {
      ...state,
      loopStart: nextStart,
      loopEnd: nextStart + loopLength,
    }
  }

  const nextEnd = loopEnd + loopLength
  if (mediaDuration <= 0 || nextEnd > mediaDuration) return null

  return {
    ...state,
    loopStart: loopEnd,
    loopEnd: nextEnd,
  }
}

export function crossedLoopEnd(
  previousTime: number,
  currentTime: number,
  loopEnd: number
) {
  return (
    currentTime >= previousTime &&
    previousTime < loopEnd &&
    currentTime >= loopEnd
  )
}

/** Resume inside an enabled loop after a seek or boundary edit. */
export function loopResumePosition(
  currentTime: number,
  loopStart: number | null,
  loopEnd: number | null,
  enabled: boolean
) {
  if (
    enabled && loopStart !== null && loopEnd !== null &&
    loopEnd > loopStart + MINIMUM_LOOP_LENGTH &&
    (currentTime < loopStart || currentTime >= loopEnd)
  ) return loopStart
  return currentTime
}

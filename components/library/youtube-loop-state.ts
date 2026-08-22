export type LoopPlaybackState = {
  currentTime: number
  isPlaying: boolean
  playbackRate: number
  loopStart: number | null
  loopEnd: number | null
  loopEnabled: boolean
}

export const MINIMUM_LOOP_LENGTH = 0.2

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
  if (state.loopStart === null || state.loopEnd === null) return null

  const loopLength = state.loopEnd - state.loopStart
  if (loopLength <= MINIMUM_LOOP_LENGTH) return null

  if (direction === "previous") {
    const nextStart = state.loopStart - loopLength
    if (nextStart < 0) return null

    return {
      ...state,
      loopStart: nextStart,
      loopEnd: state.loopStart,
    }
  }

  const nextEnd = state.loopEnd + loopLength
  if (mediaDuration <= 0 || nextEnd > mediaDuration) return null

  return {
    ...state,
    loopStart: state.loopEnd,
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

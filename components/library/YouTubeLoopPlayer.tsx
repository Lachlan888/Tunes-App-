"use client"

import { usePrivateSessionStorage } from "@/components/resilience/PrivateSessionProvider"

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { useSessionDock } from "@/components/session-dock/SessionDockProvider"
import type { SessionDockModel } from "@/components/session-dock/sessionDockModel"
import {
  createMediaLoopInPlace,
  deleteMediaLoopInPlace,
  updateMediaLoopInPlace,
} from "@/lib/actions/media-loops"
import type { UserPieceMediaLoop } from "@/lib/types"
import {
  crossedLoopEnd,
  createLoopBanks,
  loadSavedLoopIntoBank,
  loopResumePosition,
  nudgeLoopBoundary,
  resizeLoopWindow,
  shiftLoopWindow,
  selectSavedLoopWindow,
  setLoopEndAtPlayhead,
  setLoopStartAtPlayhead,
  type LoopPlaybackState,
} from "@/components/library/youtube-loop-state"

export type YouTubePlayer = {
  destroy: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getAvailablePlaybackRates?: () => number[]
  getPlaybackRate?: () => number
  setPlaybackRate: (rate: number) => void
  cueVideoById?: (options: { videoId: string; startSeconds: number }) => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  pauseVideo?: () => void
  getPlayerState?: () => number
}

type YouTubePlayerEvent = { target: YouTubePlayer }
type YouTubePlayerStateEvent = YouTubePlayerEvent & { data: number }
type YouTubePlayerErrorEvent = YouTubePlayerEvent & { data: number }

type YouTubePlayerOptions = {
  videoId: string
  playerVars?: Record<string, string | number>
  events?: {
    onReady?: (event: YouTubePlayerEvent) => void
    onStateChange?: (event: YouTubePlayerStateEvent) => void
    onError?: (event: YouTubePlayerErrorEvent) => void
  }
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: YouTubePlayerOptions
      ) => YouTubePlayer
      PlayerState?: { PLAYING: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

export type ReferencePracticeView = "media" | "sections" | "practice"

type YouTubeLoopPlayerProps = {
  videoId: string
  title: string
  recordingLabel: string
  pieceId: number
  savedLoops?: UserPieceMediaLoop[]
  mediaPanel: ReactNode
  className?: string
  presentation?: "workspace" | "session"
  onControlsOpenChange?: (open: boolean) => void
}

export type YouTubePlaybackSnapshot = {
  currentTime: number
  playbackRate: number
  isPlaying: boolean
  loopStart: number | null
  loopEnd: number | null
  loopEnabled: boolean
  activeLoopId: number | null
  mobileView: ReferencePracticeView
  passagePracticeActive: boolean
}

const DEFAULT_SPEEDS = [0.5, 0.75, 1]
const NUDGE_AMOUNTS = [0.1, 0.5, 1] as const


type NudgeAmount = (typeof NUDGE_AMOUNTS)[number]
type MarkingStage = "idle" | "draft" | "ready"

let youtubeApiPromise: Promise<void> | null = null

export function loadYouTubeIframeApi() {
  if (typeof window === "undefined" || window.YT?.Player) {
    return Promise.resolve()
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise<void>((resolve, reject) => {
      const previousReadyHandler = window.onYouTubeIframeAPIReady
      const timeout = window.setTimeout(() => {
        youtubeApiPromise = null
        reject(new Error("The video provider did not respond. Try reloading or open the source."))
      }, 15000)

      window.onYouTubeIframeAPIReady = () => {
        window.clearTimeout(timeout)
        previousReadyHandler?.()
        resolve()
      }

      if (
        !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
      ) {
        const script = document.createElement("script")
        script.src = "https://www.youtube.com/iframe_api"
        script.async = true
        document.body.appendChild(script)
      }
    })
  }

  return youtubeApiPromise
}

export function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0
}

export function getPlayerTime(player: YouTubePlayer | null) {
  if (!player) return 0

  try {
    return safeNumber(player.getCurrentTime())
  } catch {
    return 0
  }
}

function getPlayerDuration(player: YouTubePlayer | null) {
  if (!player) return 0

  try {
    return safeNumber(player.getDuration())
  } catch {
    return 0
  }
}

function getAvailableRates(player: YouTubePlayer | null) {
  try {
    const rates = player?.getAvailablePlaybackRates?.() ?? []
    return rates.length > 0 ? rates : DEFAULT_SPEEDS
  } catch {
    return DEFAULT_SPEEDS
  }
}

function formatTime(seconds: number | null, showTenths = false) {
  if (seconds === null) return "Not set"

  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const formattedMinutes = minutes.toString().padStart(2, "0")
  const remainder = safeSeconds - minutes * 60

  return showTenths
    ? `${formattedMinutes}:${remainder.toFixed(1).padStart(4, "0")}`
    : `${formattedMinutes}:${Math.floor(remainder).toString().padStart(2, "0")}`
}

function numericInputValue(value: number | null) {
  return value === null ? "" : value.toFixed(2)
}

function sortLoops(loops: UserPieceMediaLoop[]) {
  return [...loops].sort(
    (left, right) => Number(left.start_seconds) - Number(right.start_seconds)
  )
}

function readPlaybackSnapshot(storageKey: string, sessionStorage: import("@/lib/browser-storage").BrowserStorage) {
  try {
    const parsed = JSON.parse(
      sessionStorage.getItem(storageKey) ?? "null"
    ) as Partial<YouTubePlaybackSnapshot> | null
    if (!parsed) return null

    const mobileView = ["media", "sections", "practice"].includes(parsed.mobileView ?? "")
      ? parsed.mobileView!
      : "media"

    return {
      currentTime: Math.max(0, safeNumber(Number(parsed.currentTime))),
      playbackRate: Math.max(
        0.25,
        safeNumber(Number(parsed.playbackRate)) || 1
      ),
      isPlaying: false,
      loopStart:
        parsed.loopStart === null || parsed.loopStart === undefined
          ? null
          : Math.max(0, safeNumber(Number(parsed.loopStart))),
      loopEnd:
        parsed.loopEnd === null || parsed.loopEnd === undefined
          ? null
          : Math.max(0, safeNumber(Number(parsed.loopEnd))),
      loopEnabled: Boolean(parsed.loopEnabled),
      activeLoopId:
        typeof parsed.activeLoopId === "number" ? parsed.activeLoopId : null,
      mobileView,
      passagePracticeActive: Boolean(parsed.passagePracticeActive),
    } satisfies YouTubePlaybackSnapshot
  } catch {
    return null
  }
}

export default function YouTubeLoopPlayer({
  videoId,
  title,
  recordingLabel,
  pieceId,
  savedLoops = [],
  mediaPanel,
  className,
  presentation = "workspace",
  onControlsOpenChange,
}: YouTubeLoopPlayerProps) {
  const [pedalOpen, setPedalOpen] = useState(false)
  const sessionStorage = usePrivateSessionStorage()
  const playbackStorageKey = `tunes.session.v1.reference.${pieceId}.${videoId}`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const cuedTimeRef = useRef<number | null>(null)
  const requestedRateRef = useRef(1)
  const restoredSnapshotRef = useRef<YouTubePlaybackSnapshot | null>(null)
  const saveInFlightRef = useRef(false)
  const lastPlaybackTimeRef = useRef(0)
  const defaultBankVideoRef = useRef<string | null>(null)
  const [mobileView, setMobileView] =
    useState<ReferencePracticeView>("media")
  const [rawLoops, setLoops] = useState(() => sortLoops(savedLoops))
  const [loopBanks, setLoopBanks] = useState(() => createLoopBanks(sortLoops(savedLoops)))
  const [activeBankIndex, setActiveBankIndex] = useState(0)
  const [activeLoopId, setActiveLoopId] = useState<number | null>(
    () => sortLoops(savedLoops)[0]?.id ?? null
  )
  const [isReady, setIsReady] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loopStart, setLoopStart] = useState<number | null>(null)
  const [loopEnd, setLoopEnd] = useState<number | null>(null)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [playbackRate, setPlaybackRateState] = useState(1)
  const [availableRates, setAvailableRates] = useState<number[]>(DEFAULT_SPEEDS)
  const [markingStage, setMarkingStage] = useState<MarkingStage>("idle")
  const [nudgeAmount, setNudgeAmount] = useState<NudgeAmount>(0.5)
  const [draftLabel, setDraftLabel] = useState("")
  const [draftNotes, setDraftNotes] = useState("")
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [loadingBankIndex, setLoadingBankIndex] = useState<number | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletedLoop, setDeletedLoop] = useState<UserPieceMediaLoop | null>(null)
  const [passagePracticeActive, setPassagePracticeActive] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    onControlsOpenChange?.(pedalOpen || isSaveModalOpen || loadingBankIndex !== null)
  }, [pedalOpen, isSaveModalOpen, loadingBankIndex, onControlsOpenChange])

  useEffect(() => () => onControlsOpenChange?.(false), [onControlsOpenChange])

  const loops = useMemo(() => sortLoops(rawLoops), [rawLoops])
  const activeBank = loopBanks[activeBankIndex]
  const activeLoop =
    loops.find((loop) => loop.id === activeLoopId) ?? null
  const hasValidLoop =
    loopStart !== null && loopEnd !== null && loopEnd > loopStart + 0.2 && (duration <= 0 || loopEnd <= duration)
  const activeLoopIndex = activeLoop
    ? loops.findIndex((loop) => loop.id === activeLoop.id)
    : -1
  const applyLoopWindow = useCallback((state: LoopPlaybackState) => {
    setLoopStart(state.loopStart)
    setLoopEnd(state.loopEnd)
    setLoopEnabled(state.loopEnabled)
  }, [])

  const preparePlayback = useCallback((player: YouTubePlayer | null, seconds: number) => {
    if (!player) return
    // seekTo starts an unstarted/cued YouTube player. Cue it instead until Play.
    if (player.getPlayerState?.() === 2) {
      cuedTimeRef.current = null
      player.seekTo(seconds, true)
    } else {
      cuedTimeRef.current = seconds
      player.cueVideoById?.({ videoId, startSeconds: seconds })
    }
  }, [videoId])

  const getLiveLoopPlaybackState = useCallback((): LoopPlaybackState => {
    return {
      currentTime: cuedTimeRef.current ?? getPlayerTime(playerRef.current),
      isPlaying,
      playbackRate,
      loopStart,
      loopEnd,
      loopEnabled,
    }
  }, [isPlaying, loopEnabled, loopEnd, loopStart, playbackRate])

  const resetPassageState = useCallback(() => {
    setActiveLoopId(null)
    setLoopStart(null)
    setLoopEnd(null)
    setLoopEnabled(false)
    setMarkingStage("idle")
    setDraftLabel("")
    setDraftNotes("")
    setSaveMessage(null)
    setSaveError(null)
    setPassagePracticeActive(false)
  }, [])

  useEffect(() => {
    setLoops(sortLoops(savedLoops))
    setLoopBanks(createLoopBanks(sortLoops(savedLoops)))
    setActiveBankIndex(0)
    setActiveLoopId(sortLoops(savedLoops)[0]?.id ?? null)
  }, [savedLoops, videoId])

  useEffect(() => {
    if (!isReady) return

    setLoopBanks((current) =>
      current.map((bank, index) => {
        if (index !== activeBankIndex) return bank
        const saved = rawLoops.find((loop) => loop.id === bank.savedLoopId)
        const hasDraft = loopStart !== null || loopEnd !== null
        const dirty = saved
          ? Math.abs(Number(saved.start_seconds) - (loopStart ?? 0)) > 0.005 ||
            Math.abs(Number(saved.end_seconds) - (loopEnd ?? 0)) > 0.005 ||
            Math.abs(Number(saved.playback_rate) - playbackRate) > 0.005
          : hasDraft

        return {
          ...bank,
          name: saved?.label ?? (hasDraft ? "Unsaved" : "Empty"),
          startSeconds: loopStart,
          endSeconds: loopEnd,
          playbackRate,
          dirty,
        }
      })
    )
  }, [activeBankIndex, isReady, loopEnd, loopStart, playbackRate, rawLoops])

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!container) return

    const restoredSnapshot = readPlaybackSnapshot(playbackStorageKey, sessionStorage)
    restoredSnapshotRef.current = restoredSnapshot
    cuedTimeRef.current = null
    requestedRateRef.current = restoredSnapshot?.playbackRate ?? 1
    setIsReady(false)
    setPlayerError(null)
    setCurrentTime(restoredSnapshot?.currentTime ?? 0)
    lastPlaybackTimeRef.current = restoredSnapshot?.currentTime ?? 0
    setDuration(0)
    setIsPlaying(false)
    setPlaybackRateState(restoredSnapshot?.playbackRate ?? 1)
    setAvailableRates(DEFAULT_SPEEDS)
    defaultBankVideoRef.current = null
    resetPassageState()
    if (restoredSnapshot) {
      setMobileView(restoredSnapshot.mobileView)
      setActiveLoopId(restoredSnapshot.activeLoopId)
      setLoopStart(restoredSnapshot.loopStart)
      setLoopEnd(restoredSnapshot.loopEnd)
      setLoopEnabled(restoredSnapshot.loopEnabled)
      setPassagePracticeActive(restoredSnapshot.passagePracticeActive)
    }

    loadYouTubeIframeApi().then(() => {
      if (cancelled || !container || !window.YT?.Player) return

      // YouTube replaces its mount node. Keep React's wrapper intact so source
      // changes and Strict Mode cleanup always have a fresh mount target.
      const mount = document.createElement("div")
      container.replaceChildren(mount)
      const player = new window.YT.Player(mount, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return

            const restored = restoredSnapshotRef.current
            playerRef.current = event.target
            setDuration(getPlayerDuration(event.target))
            setAvailableRates(getAvailableRates(event.target))
            if (restored) {
              preparePlayback(event.target, restored.currentTime)
              try {
                event.target.setPlaybackRate(restored.playbackRate)
              } catch {
                setPlaybackRateState(1)
              }
            }
            setIsReady(true)
          },
          onStateChange: (event) => {
            if (cancelled) return
            const readyDuration = getPlayerDuration(event.target)
            if (readyDuration > 0) setDuration(readyDuration)
            const playingState = window.YT?.PlayerState?.PLAYING
            if (event.data === playingState) {
              cuedTimeRef.current = null
              try { event.target.setPlaybackRate(requestedRateRef.current) } catch { /* Provider keeps its supported rate. */ }
            }
            setIsPlaying(
              playingState !== undefined && event.data === playingState
            )
          },
          onError: () => {
            if (cancelled) return
            setIsReady(false)
            setIsPlaying(false)
            setPlayerError("This recording is unavailable in the player.")
          },
        },
      })

      playerRef.current = player
    }).catch((error: unknown) => {
      if (cancelled) return
      setIsReady(false)
      setPlayerError(
        error instanceof Error && error.message.includes("did not respond")
          ? error.message
          : "This recording could not be loaded."
      )
    })

    return () => {
      cancelled = true
      const player = playerRef.current
      player?.pauseVideo?.()

      try {
        player?.destroy()
      } catch {
        // Ignore YouTube cleanup failures while replacing a recording.
      }

      playerRef.current = null
      container.replaceChildren()
    }
  }, [playbackStorageKey, preparePlayback, resetPassageState, videoId, sessionStorage])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const player = playerRef.current
      const nextTime = cuedTimeRef.current ?? getPlayerTime(player)
      const previousTime = lastPlaybackTimeRef.current
      lastPlaybackTimeRef.current = nextTime
      setCurrentTime(nextTime)

      if (!player || !loopEnabled || !hasValidLoop) return

      const playingState = window.YT?.PlayerState?.PLAYING
      if (
        playingState !== undefined &&
        player.getPlayerState?.() !== playingState
      ) {
        return
      }

      if (
        loopStart !== null &&
        loopEnd !== null &&
        crossedLoopEnd(previousTime, nextTime, loopEnd)
      ) {
        player.seekTo(loopStart, true)
        player.playVideo()
        lastPlaybackTimeRef.current = nextTime
      }
    }, 200)

    return () => window.clearInterval(intervalId)
  }, [hasValidLoop, loopEnabled, loopEnd, loopStart])

  useEffect(() => {
    if (!isReady) return

    const snapshot: YouTubePlaybackSnapshot = {
      currentTime,
      playbackRate,
      isPlaying,
      loopStart,
      loopEnd,
      loopEnabled,
      activeLoopId,
      mobileView,
      passagePracticeActive,
    }
    sessionStorage.setItem(
      playbackStorageKey,
      JSON.stringify(snapshot)
    )
  }, [
    activeLoopId,
    currentTime,
    isPlaying,
    isReady,
    loopEnabled,
    loopEnd,
    loopStart,
    mobileView,
    passagePracticeActive,
    playbackRate,
    playbackStorageKey,
    sessionStorage,
  ])

  const setPlaybackRate = useCallback((rate: number) => {
    try {
      requestedRateRef.current = rate
      playerRef.current?.setPlaybackRate(rate)
      setPlaybackRateState(rate)
    } catch {
      // Keep the accepted YouTube rate when this recording rejects a value.
    }
  }, [])

  useEffect(() => {
    if (!isReady || defaultBankVideoRef.current === videoId) return

    const restored = restoredSnapshotRef.current
    const initialBanks = createLoopBanks(sortLoops(savedLoops))
    const restoredBankIndex = restored?.activeLoopId
      ? initialBanks.findIndex((bank) => bank.savedLoopId === restored.activeLoopId)
      : -1
    const bankIndex = restoredBankIndex >= 0 ? restoredBankIndex : 0
    const bank = initialBanks[bankIndex]
    const hasWindow =
      bank.startSeconds !== null &&
      bank.endSeconds !== null &&
      bank.endSeconds > bank.startSeconds + 0.2

    defaultBankVideoRef.current = videoId
    setLoopBanks(initialBanks)
    setActiveBankIndex(bankIndex)

    if (restored) {
      setDraftLabel(bank.savedLoopId ? bank.name : "")
      setDraftNotes(
        rawLoops.find((loop) => loop.id === bank.savedLoopId)?.notes ?? ""
      )
      setMarkingStage(
        bank.savedLoopId
          ? "idle"
          : restored.loopStart !== null && restored.loopEnd !== null
            ? "ready"
            : "draft"
      )
      return
    }

    setActiveLoopId(bank.savedLoopId)
    setLoopStart(bank.startSeconds)
    setLoopEnd(bank.endSeconds)
    setLoopEnabled(hasWindow)
    setDraftLabel(bank.savedLoopId ? bank.name : "")
    setDraftNotes(
      rawLoops.find((loop) => loop.id === bank.savedLoopId)?.notes ?? ""
    )
    setMarkingStage(bank.savedLoopId ? "idle" : hasWindow ? "ready" : "draft")

    if (bank.startSeconds !== null) {
      preparePlayback(playerRef.current, bank.startSeconds)
      lastPlaybackTimeRef.current = bank.startSeconds
      setCurrentTime(bank.startSeconds)
    }
    setPlaybackRate(bank.playbackRate)
  }, [isReady, preparePlayback, rawLoops, savedLoops, setPlaybackRate, videoId])

  const playFrom = useCallback((seconds?: number) => {
    const player = playerRef.current
    if (!player) return

    const current = cuedTimeRef.current ?? getPlayerTime(player)
    const wasCued = cuedTimeRef.current !== null
    cuedTimeRef.current = null
    const target = seconds ?? loopResumePosition(current, loopStart, loopEnd, loopEnabled && hasValidLoop)
    if (wasCued || seconds !== undefined || target !== current) {
      player.seekTo(target, true)
      lastPlaybackTimeRef.current = target
      setCurrentTime(target)
    }
    player.playVideo()
  }, [hasValidLoop, loopEnabled, loopEnd, loopStart])

  const selectLoop = useCallback((loop: UserPieceMediaLoop, audition = false) => {
    playerRef.current?.pauseVideo?.()
    setIsPlaying(false)
    const start = Number(loop.start_seconds)
    const end = Number(loop.end_seconds)
    const rate = Number(loop.playback_rate)

    const selectedState = selectSavedLoopWindow(
      getLiveLoopPlaybackState(),
      { startSeconds: start, endSeconds: end, playbackRate: rate }
    )

    if (!selectedState) return

    const matchingBankIndex = loopBanks.findIndex(
      (bank) => bank.savedLoopId === loop.id
    )
    const targetBankIndex =
      matchingBankIndex >= 0 ? matchingBankIndex : activeBankIndex
    setActiveBankIndex(targetBankIndex)
    setLoopBanks((current) =>
      loadSavedLoopIntoBank(current, targetBankIndex, loop)
    )
    setActiveLoopId(loop.id)
    applyLoopWindow(selectedState)
    setMarkingStage("idle")
    setDraftLabel(loop.label)
    setDraftNotes(loop.notes ?? "")
    setSaveMessage(null)
    setSaveError(null)
    setDeletedLoop(null)
    preparePlayback(playerRef.current, start)
    lastPlaybackTimeRef.current = start
    setCurrentTime(start)
    if (audition) playerRef.current?.playVideo()
    setPlaybackRate(selectedState.playbackRate)
  }, [activeBankIndex, applyLoopWindow, getLiveLoopPlaybackState, loopBanks, preparePlayback, setPlaybackRate])

  const stopPlayback = useCallback(() => {
    const target = loopStart ?? 0
    playerRef.current?.pauseVideo?.()
    preparePlayback(playerRef.current, target)
    lastPlaybackTimeRef.current = target
    setCurrentTime(target)
    setIsPlaying(false)
  }, [loopStart, preparePlayback])

  const seekPlayback = useCallback((seconds: number) => {
    if (isPlaying) playerRef.current?.seekTo(seconds, true)
    else preparePlayback(playerRef.current, seconds)
    lastPlaybackTimeRef.current = seconds
    setCurrentTime(seconds)
  }, [isPlaying, preparePlayback])

  const selectPreviousLoop = useCallback(() => {
    const previous = loops[activeLoopIndex - 1]
    if (previous) selectLoop(previous)
  }, [activeLoopIndex, loops, selectLoop])

  const selectNextLoop = useCallback(() => {
    const next = loops[activeLoopIndex + 1]
    if (next) selectLoop(next)
  }, [activeLoopIndex, loops, selectLoop])

  useEffect(() => {
    function handleTransportKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) {
        return
      }

      const target = event.target as HTMLElement | null
      const targetName = target?.tagName?.toUpperCase()
      if (
        target?.isContentEditable ||
        targetName === "INPUT" ||
        targetName === "SELECT" ||
        targetName === "TEXTAREA" ||
        targetName === "BUTTON" ||
        targetName === "A"
      ) {
        return
      }

      if (!isReady) return

      if (event.code === "Space") {
        event.preventDefault()
        if (isPlaying) playerRef.current?.pauseVideo?.()
        else playFrom()
        return
      }

      if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        event.preventDefault()
        const direction = event.code === "ArrowLeft" ? -5 : 5
        const nextTime = Math.min(
          duration || Number.POSITIVE_INFINITY,
          Math.max(0, (cuedTimeRef.current ?? getPlayerTime(playerRef.current)) + direction)
        )
        seekPlayback(nextTime)
      }
    }

    window.addEventListener("keydown", handleTransportKeyDown)
    return () => window.removeEventListener("keydown", handleTransportKeyDown)
  }, [duration, isPlaying, isReady, playFrom, seekPlayback])

  function selectLoopBank(index: number) {
    const bank = loopBanks[index]
    if (!bank || index === activeBankIndex) return

    playerRef.current?.pauseVideo?.()
    setIsPlaying(false)
    setActiveBankIndex(index)
    setActiveLoopId(bank.savedLoopId)
    setDraftLabel(bank.savedLoopId ? bank.name : "")
    setDraftNotes(
      rawLoops.find((loop) => loop.id === bank.savedLoopId)?.notes ?? ""
    )
    setSaveMessage(null)
    setSaveError(null)
    setDeletedLoop(null)

    const hasWindow =
      bank.startSeconds !== null &&
      bank.endSeconds !== null &&
      bank.endSeconds > bank.startSeconds + 0.2

    applyLoopWindow({
      ...getLiveLoopPlaybackState(),
      loopStart: bank.startSeconds,
      loopEnd: bank.endSeconds,
      loopEnabled: hasWindow,
      playbackRate: bank.playbackRate,
    })
    setMarkingStage(bank.savedLoopId ? "idle" : hasWindow ? "ready" : "draft")

    if (bank.startSeconds !== null) {
      preparePlayback(playerRef.current, bank.startSeconds)
      lastPlaybackTimeRef.current = bank.startSeconds
      setCurrentTime(bank.startSeconds)
    }
    setPlaybackRate(bank.playbackRate)
  }

  function loadLoopIntoBank(loop: UserPieceMediaLoop) {
    if (loadingBankIndex === null) return

    const bankIndex = loadingBankIndex
    setLoopBanks((current) => loadSavedLoopIntoBank(current, bankIndex, loop))
    setLoadingBankIndex(null)

    playerRef.current?.pauseVideo?.()
    setIsPlaying(false)
    setActiveBankIndex(bankIndex)
    selectLoop(loop)
  }

  const openSaveModal = useCallback(() => {
    if (!hasValidLoop) return
    setDraftLabel(activeLoop?.label ?? "")
    setDraftNotes(activeLoop?.notes ?? "")
    setSaveError(null)
    setIsSaveModalOpen(true)
  }, [activeLoop, hasValidLoop])

  const startPassagePractice = useCallback(() => {
    if (!activeLoop || !hasValidLoop) return

    setPassagePracticeActive(true)
    setLoopEnabled(true)
    setMobileView("practice")
    playFrom(loopStart ?? Number(activeLoop.start_seconds))
  }, [activeLoop, hasValidLoop, loopStart, playFrom])

  const endPassagePractice = useCallback(() => {
    setPassagePracticeActive(false)
    playerRef.current?.pauseVideo?.()
  }, [])

  const setDraftLoopStart = useCallback(() => {
    const nextState = setLoopStartAtPlayhead(getLiveLoopPlaybackState())
    applyLoopWindow(nextState)
    setMarkingStage(nextState.loopEnd === null ? "draft" : "ready")
    setSaveError(null)
  }, [applyLoopWindow, getLiveLoopPlaybackState])

  const setDraftLoopEnd = useCallback(() => {
    const result = setLoopEndAtPlayhead({ ...getLiveLoopPlaybackState(), loopStart: loopStart ?? 0 })

    if (!result.ok) {
      setSaveError(result.error)
      return
    }

    applyLoopWindow(result.state)
    if (result.state.loopEnd !== null) {
      lastPlaybackTimeRef.current = Math.min(
        lastPlaybackTimeRef.current,
        result.state.loopEnd - 0.001
      )
    }
    setMarkingStage("ready")
    setSaveError(null)
  }, [applyLoopWindow, getLiveLoopPlaybackState, loopStart])

  function adjustBoundary(boundary: "start" | "end", amount: number) {
    applyLoopWindow(
      nudgeLoopBoundary(
        getLiveLoopPlaybackState(),
        boundary,
        amount,
        duration
      )
    )
  }

  function halveLoop() {
    applyLoopWindow(
      resizeLoopWindow(getLiveLoopPlaybackState(), "halve", duration)
    )
  }

  function doubleLoop() {
    applyLoopWindow(
      resizeLoopWindow(getLiveLoopPlaybackState(), "double", duration)
    )
  }

  const sectionState = { currentTime, isPlaying, playbackRate, loopStart, loopEnd, loopEnabled }
  const canShiftPrevious = shiftLoopWindow(sectionState, "previous", duration) !== null
  const canShiftNext = shiftLoopWindow(sectionState, "next", duration) !== null

  function shiftSection(direction: "previous" | "next") {
    const nextState = shiftLoopWindow(getLiveLoopPlaybackState(), direction, duration)
    if (nextState) applyLoopWindow(nextState)
  }

  function clearBoundaries() {
    setLoopStart(null)
    setLoopEnd(null)
    setLoopEnabled(false)
    if (markingStage !== "idle") {
      setLoopStart(0)
      setMarkingStage("draft")
    }
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      isPending ||
      saveInFlightRef.current ||
      !hasValidLoop ||
      !draftLabel.trim()
    ) {
      return
    }

    const formData = new FormData(event.currentTarget)
    formData.set("piece_id", String(pieceId))
    formData.set("youtube_video_id", videoId)
    formData.set("label", draftLabel)
    formData.set("notes", draftNotes)
    formData.set("start_seconds", numericInputValue(loopStart))
    formData.set("end_seconds", numericInputValue(loopEnd))
    formData.set("playback_rate", String(playbackRate))
    if (activeLoop) formData.set("loop_id", String(activeLoop.id))

    setSaveMessage(null)
    setSaveError(null)
    saveInFlightRef.current = true

    startTransition(async () => {
      try {
        const result = activeLoop
          ? await updateMediaLoopInPlace(formData)
          : await createMediaLoopInPlace(formData)

        if (!result.ok || !result.loop) {
          setSaveError(
            result.ok ? "Couldn’t save this section." : result.error
          )
          return
        }

        const savedLoop = result.loop
        setLoops((current) =>
          sortLoops([
            ...current.filter((loop) => loop.id !== savedLoop.id),
            savedLoop,
          ])
        )
        setActiveLoopId(savedLoop.id)
        setLoopBanks((current) =>
          current.map((bank, index) =>
            index === activeBankIndex
              ? {
                  ...bank,
                  savedLoopId: savedLoop.id,
                  name: savedLoop.label,
                  startSeconds: Number(savedLoop.start_seconds),
                  endSeconds: Number(savedLoop.end_seconds),
                  playbackRate: Number(savedLoop.playback_rate),
                  dirty: false,
                }
              : bank
          )
        )
        setMarkingStage("idle")
        setDeletedLoop(null)
        setIsSaveModalOpen(false)
        setSaveMessage(activeLoop ? "Loop updated" : "Loop saved")
      } catch {
        setSaveError("Couldn’t save this section. Try again.")
      } finally {
        saveInFlightRef.current = false
      }
    })
  }

  function handleDelete() {
    if (!activeLoop || isPending) return
    if (!window.confirm(`Delete section “${activeLoop.label}”?`)) return

    const loopToDelete = activeLoop
    const formData = new FormData()
    formData.set("loop_id", String(activeLoop.id))
    formData.set("piece_id", String(pieceId))
    formData.set("youtube_video_id", videoId)
    setSaveError(null)

    startTransition(async () => {
      try {
      const result = await deleteMediaLoopInPlace(formData)

      if (!result.ok) {
        setSaveError(result.error)
        return
      }

      setLoops((current) => current.filter((loop) => loop.id !== loopToDelete.id))
      setLoopBanks((current) =>
        current.map((bank, index) =>
          index === activeBankIndex
            ? {
                ...bank,
                savedLoopId: null,
                name: "Empty",
                startSeconds: null,
                endSeconds: null,
                playbackRate: 1,
                dirty: false,
              }
            : bank
        )
      )
      setDeletedLoop(loopToDelete)
      resetPassageState()
      setIsSaveModalOpen(false)
      setSaveMessage("Loop deleted")
      } catch {
        setSaveError("Couldn’t delete this passage. Your playlist is unchanged. Try again.")
      }
    })
  }

  function undoDelete() {
    if (!deletedLoop || isPending) return

    const formData = new FormData()
    formData.set("piece_id", String(pieceId))
    formData.set("youtube_video_id", videoId)
    formData.set("label", deletedLoop.label)
    formData.set("notes", deletedLoop.notes ?? "")
    formData.set("start_seconds", String(deletedLoop.start_seconds))
    formData.set("end_seconds", String(deletedLoop.end_seconds))
    formData.set("playback_rate", String(deletedLoop.playback_rate))
    setSaveError(null)

    startTransition(async () => {
      try {
      const result = await createMediaLoopInPlace(formData)

      if (!result.ok || !result.loop) {
        setSaveError(result.ok ? "Couldn’t restore this passage." : result.error)
        return
      }

      const restoredLoop = result.loop
      setLoops((current) => sortLoops([...current, restoredLoop]))
      setLoopBanks((current) =>
        loadSavedLoopIntoBank(current, activeBankIndex, restoredLoop)
      )
      setActiveLoopId(restoredLoop.id)
      setLoopStart(Number(restoredLoop.start_seconds))
      setLoopEnd(Number(restoredLoop.end_seconds))
      setLoopEnabled(true)
      setPlaybackRate(Number(restoredLoop.playback_rate) || 1)
      setDraftLabel(restoredLoop.label)
      setDraftNotes(restoredLoop.notes ?? "")
      setMarkingStage("idle")
      setDeletedLoop(null)
      setSaveMessage("Passage restored")
      } catch {
        setSaveError("Couldn’t restore this passage. Try Undo again.")
      }
    })
  }

  const dockModel = useMemo<SessionDockModel>(() => {
    const sectionLabel = `${activeBank.key} · ${activeBank.name}${activeBank.dirty && activeBank.savedLoopId ? " · Edited" : ""}`

    return {
      id: `reference-media:${pieceId}:${videoId}`,
      context: "reference-media",
      identity: {
        title: recordingLabel,
        detail: sectionLabel,
      },
      primaryAction: {
        id: "playback",
        label: isPlaying ? "Pause" : "Play",
        ariaLabel: isPlaying
          ? `Pause ${recordingLabel}`
          : `Play ${recordingLabel}`,
        disabled: !isReady,
        onInvoke: () => {
          if (isPlaying) playerRef.current?.pauseVideo?.()
          else playFrom()
        },
        tone: "practice",
        closeOnInvoke: false,
      },
      secondaryActions: [
        {
          id: "loop-in",
          label: "Loop In",
          ariaLabel: `Set loop ${activeBank.key} start`,
          disabled: !isReady,
          onInvoke: setDraftLoopStart,
          tone: "secondary",
          closeOnInvoke: false,
        },
        {
          id: "loop-out",
          label: "Loop Out",
          ariaLabel: `Set loop ${activeBank.key} end`,
          disabled: !isReady,
          onInvoke: setDraftLoopEnd,
          tone: "practice",
          closeOnInvoke: false,
        },
        {
          id: "save-loop",
          label: "Save Loop",
          ariaLabel: `Save loop ${activeBank.key}`,
          disabled: !hasValidLoop,
          onInvoke: openSaveModal,
          tone: "primary",
          closeOnInvoke: false,
        },
        {
          id: "previous",
          label: "Previous",
          ariaLabel: "Previous loop",
          disabled: !isReady || activeLoopIndex <= 0,
          onInvoke: selectPreviousLoop,
          tone: "secondary",
          closeOnInvoke: false,
        },
        {
          id: "stop",
          label: "Stop",
          ariaLabel: "Stop recording",
          disabled: !isReady,
          onInvoke: stopPlayback,
          tone: "secondary",
          closeOnInvoke: false,
        },
        {
          id: "next",
          label: "Next",
          ariaLabel: "Next loop",
          disabled:
            !isReady ||
            activeLoopIndex < 0 ||
            activeLoopIndex >= loops.length - 1,
          onInvoke: selectNextLoop,
          tone: "secondary",
          closeOnInvoke: false,
        },
        {
          id: "loop",
          label: loopEnabled ? "Loop on" : "Loop off",
          ariaLabel: loopEnabled ? "Turn loop off" : "Turn loop on",
          disabled: !hasValidLoop,
          pressed: loopEnabled,
          onInvoke: () => setLoopEnabled((current) => !current),
          tone: loopEnabled ? "practice" : "secondary",
          closeOnInvoke: false,
        },
        {
          id: "practice",
          label: passagePracticeActive ? "End practice" : "Practise passage",
          ariaLabel: passagePracticeActive
            ? `End practice for ${sectionLabel}`
            : `Practise ${sectionLabel}`,
          disabled: !activeLoop || !hasValidLoop,
          onInvoke: passagePracticeActive
            ? endPassagePractice
            : startPassagePractice,
          tone: passagePracticeActive ? "secondary" : "practice",
          closeOnInvoke: false,
        },
        {
          id: "section",
          label: "Passages",
          onInvoke: () => setMobileView("sections"),
          tone: "secondary",
        },
      ],
      progress: {
        label: `${formatTime(currentTime)} of ${formatTime(duration)}`,
        value: currentTime,
        max: duration,
      },
      status: {
        label: passagePracticeActive
          ? `Passage practice · ${playbackRate}×`
          : `${loopEnabled ? "Loop on" : "Loop off"} · ${playbackRate}×`,
        tone: "practice",
      },
      collapsedContent: {
        actionIds: ["playback", "loop-in", "loop-out", "save-loop"],
        showProgress: true,
      },
      expandedContent: {
        title: `${recordingLabel} controls`,
        description:
          "Playback, loop, speed, saved passages and the metronome stay attached to this recording. Space plays or pauses; arrow keys seek five seconds when focus is outside a control.",
        actionIds: [
          "playback",
          "stop",
          "loop-in",
          "loop-out",
          "save-loop",
          "loop",
          "practice",
          "section",
        ],
        tools: ["metronome"],
        showIdentity: false,
      },
      transport: {
        currentTime,
        duration,
        disabled: !isReady,
        unavailableMessage: playerError
          ? "Player unavailable — open the source or choose another recording."
          : "Loading provider controls…",
        onSeek: seekPlayback,
        speed: {
          value: playbackRate,
          options: availableRates,
          disabled: !isReady,
          onChange: setPlaybackRate,
        },
      },
      persistence: {
        shareable: "url",
        transient: "session",
        key: playbackStorageKey,
      },
      announcement: `${isPlaying ? "Playing" : "Paused"}. ${
        loopEnabled ? "Loop on" : "Loop off"
      }. Speed ${playbackRate}.${
        passagePracticeActive ? " Passage practice active." : ""
      }`,
    }
  }, [
    activeLoop,
    activeBank,
    activeLoopIndex,
    availableRates,
    currentTime,
    duration,
    endPassagePractice,
    hasValidLoop,
    isPlaying,
    isReady,
    loops.length,
    loopEnabled,
    openSaveModal,
    passagePracticeActive,
    pieceId,
    playbackRate,
    playbackStorageKey,
    playerError,
    playFrom,
    recordingLabel,
    seekPlayback,
    selectNextLoop,
    selectPreviousLoop,
    setPlaybackRate,
    setDraftLoopEnd,
    setDraftLoopStart,
    startPassagePractice,
    stopPlayback,
    videoId,
  ])

  useSessionDock(`reference-media:${pieceId}`, presentation === "session" ? null : dockModel)

  const loopStartPercent =
    duration > 0 && loopStart !== null ? (loopStart / duration) * 100 : 0
  const loopWidthPercent =
    duration > 0 && loopStart !== null && loopEnd !== null
      ? ((loopEnd - loopStart) / duration) * 100
      : 0
  const pedalButton =
    "group relative min-h-16 rounded-xl border border-white/15 bg-[#151714] px-3 py-3 text-center text-base font-semibold text-[#f6f0df] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_0_#090a08] transition active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"

  function stepPlaybackRate(direction: -1 | 1) {
    if (availableRates.length === 0) return

    const orderedRates = [...availableRates].sort((left, right) => left - right)
    const exactIndex = orderedRates.findIndex(
      (rate) => Math.abs(rate - playbackRate) < 0.001
    )
    const currentIndex =
      exactIndex >= 0
        ? exactIndex
        : orderedRates.reduce(
            (closest, rate, index) =>
              Math.abs(rate - playbackRate) <
              Math.abs(orderedRates[closest] - playbackRate)
                ? index
                : closest,
            0
          )
    const nextIndex = Math.min(
      orderedRates.length - 1,
      Math.max(0, currentIndex + direction)
    )
    setPlaybackRate(orderedRates[nextIndex])
  }

  const pedal = (
          <section aria-labelledby="loop-pedal-heading" className="min-h-[42rem] overflow-hidden rounded-[1.75rem] border-2 border-[#4f5349] bg-[#2a2d28] p-4 text-[#f6f0df] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_28px_rgba(25,22,17,0.28)] sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <h2 id="loop-pedal-heading" className="font-mono text-xl font-black uppercase tracking-[0.08em]">Loop pedal</h2>
              <div className="rounded-md border border-[#778169] bg-[#131611] px-3 py-2 font-mono text-xs text-[#c7e58e] shadow-inner">
                {formatTime(currentTime, true)} · {playbackRate}×
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Loop pedal controls">
              <button type="button" aria-pressed={isPlaying} className={pedalButton} disabled={!isReady} onClick={() => isPlaying ? playerRef.current?.pauseVideo?.() : playFrom()}>
                <span className="block">{isPlaying ? "Pause" : "Play"}</span>
                <span aria-hidden="true" className={joinClasses("mx-auto mt-2 block h-2.5 w-2.5 rounded-full", isPlaying ? "bg-[#bfe879] shadow-[0_0_10px_#bfe879]" : "bg-[#53584e]")} />
              </button>
              <button type="button" className={pedalButton} disabled={!isReady} onClick={setDraftLoopStart}>
                <span className="block">Loop In</span>
                <span aria-hidden="true" className="mx-auto mt-2 block h-2.5 w-2.5 rounded-full bg-[#d9a75e]" />
              </button>
              <button type="button" className={pedalButton} disabled={!isReady} onClick={setDraftLoopEnd}>
                <span className="block">Loop Out</span>
                <span aria-hidden="true" className={joinClasses("mx-auto mt-2 block h-2.5 w-2.5 rounded-full", hasValidLoop ? "bg-[#ef765f] shadow-[0_0_10px_#ef765f]" : "bg-[#70453d]")} />
              </button>
              <button type="button" className={pedalButton} disabled={!hasValidLoop} onClick={openSaveModal}>
                <span className="block">Save Loop</span>
                <span aria-hidden="true" className="mx-auto mt-2 block h-2.5 w-2.5 rounded-full bg-[#79a8c6]" />
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-[#d7d3c7]">Banks</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {loopBanks.map((bank, index) => (
                  <div
                    key={bank.key}
                    className={joinClasses(
                      "min-h-16 min-w-0 rounded-lg border px-2 py-2 transition focus-within:ring-2 focus-within:ring-[#c7e58e]",
                      index === activeBankIndex
                        ? "border-[#c7e58e] bg-[#11140f] shadow-[0_0_0_1px_#c7e58e,0_0_16px_rgba(199,229,142,0.18)]"
                        : "border-white/15 bg-[#20231f] hover:bg-[#181a17]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <button type="button" aria-pressed={index === activeBankIndex} aria-label={`Select loop bank ${bank.key}: ${bank.name}`} onClick={() => selectLoopBank(index)} className="min-h-11 min-w-11 rounded px-1 font-mono text-lg font-black text-[#c7e58e] focus:outline-none">
                        {bank.key}
                      </button>
                      <button type="button" aria-label={`Load a saved loop into bank ${bank.key}`} title={`Load saved loop into bank ${bank.key}`} onClick={() => setLoadingBankIndex(index)} className="grid h-11 w-11 place-items-center rounded border border-white/15 bg-[#141713] text-[#d7d3c7] transition hover:border-[#c7e58e] hover:text-[#c7e58e] focus:outline-none">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 3h12l2 2v16H5z" />
                          <path d="M8 3v6h8V3" />
                          <path d="M8 14h8v7H8z" />
                        </svg>
                      </button>
                    </div>
                    <button type="button" aria-pressed={index === activeBankIndex} onClick={() => selectLoopBank(index)} className="mt-0.5 block min-h-11 w-full truncate rounded px-1 text-left text-xs text-[#e4dece] focus:outline-none">
                      {bank.name}{bank.dirty && bank.savedLoopId ? " · Edited" : ""}
                    </button>
                  </div>
                ))}
              </div>
            </fieldset>

            <section aria-label="Loop adjustment" className="mt-5 rounded-xl border border-white/10 bg-[#1d201c] p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-base font-bold text-[#f6f0df]">Loop {activeBank.key}</h3>
                <p className="truncate text-sm text-[#b8bba9]">{activeBank.name}</p>
              </div>

              <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <span className="font-mono text-xs text-[#d9a75e]">{formatTime(loopStart, true)}</span>
                <div className="relative h-11">
                  <div className="absolute inset-x-0 top-4 h-2 rounded-full bg-[#0e100d]">
                    {hasValidLoop ? <span className="absolute h-full rounded-full bg-[#c7e58e]" style={{ left: `${loopStartPercent}%`, width: `${Math.max(loopWidthPercent, 1)}%` }} /> : null}
                  </div>
                  <input aria-label="Adjust loop in point" type="range" min={0} max={duration || 1} step={0.1} value={Math.min(loopStart ?? 0, duration || 1)} disabled={!hasValidLoop} onChange={(event) => { const nextStart = Math.min(Number(event.target.value), (loopEnd ?? duration) - 0.2); setLoopStart(Math.max(0, nextStart)); setMarkingStage("ready") }} className="pointer-events-none absolute inset-0 h-11 w-full appearance-none bg-transparent disabled:opacity-40 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#10120f] [&::-moz-range-thumb]:bg-[#d9a75e] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#10120f] [&::-webkit-slider-thumb]:bg-[#d9a75e]" />
                  <input aria-label="Adjust loop out point" type="range" min={0} max={duration || 1} step={0.1} value={Math.min(loopEnd ?? 0, duration || 1)} disabled={!hasValidLoop} onChange={(event) => { const nextEnd = Math.max(Number(event.target.value), (loopStart ?? 0) + 0.2); setLoopEnd(Math.min(duration || nextEnd, nextEnd)); setMarkingStage("ready") }} className="pointer-events-none absolute inset-0 h-11 w-full appearance-none bg-transparent disabled:opacity-40 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#10120f] [&::-moz-range-thumb]:bg-[#ef765f] [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#10120f] [&::-webkit-slider-thumb]:bg-[#ef765f]" />
                </div>
                <span className="font-mono text-xs text-[#ef765f]">{formatTime(loopEnd, true)}</span>
              </div>

              <div className="mt-4 border-t border-white/10">
                {([
                  { id: "in", label: "Loop In", value: formatTime(loopStart, true), onMinus: () => adjustBoundary("start", -nudgeAmount), onPlus: () => adjustBoundary("start", nudgeAmount) },
                  { id: "speed", label: "Speed", value: `${Math.round(playbackRate * 100)}%`, onMinus: () => stepPlaybackRate(-1), onPlus: () => stepPlaybackRate(1) },
                  { id: "out", label: "Loop Out", value: formatTime(loopEnd, true), onMinus: () => adjustBoundary("end", -nudgeAmount), onPlus: () => adjustBoundary("end", nudgeAmount) },
                ] as const).map((control) => (
                  <div key={control.id} className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-2 border-b border-white/10 py-2">
                    <p className="text-xs font-semibold text-[#b8bba9]">{control.label}</p>
                    <div className="grid min-w-0 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-1">
                      <button type="button" aria-label={`Decrease ${control.label}`} disabled={control.id === "speed" ? !isReady : !hasValidLoop} onClick={control.onMinus} className="min-h-11 min-w-11 rounded-md border border-white/15 text-lg hover:bg-[#30342d] disabled:opacity-35">−</button>
                      <span className="whitespace-nowrap text-center font-mono text-sm text-[#c7e58e]">{control.value}</span>
                      <button type="button" aria-label={`Increase ${control.label}`} disabled={control.id === "speed" ? !isReady : !hasValidLoop} onClick={control.onPlus} className="min-h-11 min-w-11 rounded-md border border-white/15 text-lg hover:bg-[#30342d] disabled:opacity-35">+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#b8bba9]">Step</span>
                {NUDGE_AMOUNTS.map((amount) => (
                  <button key={amount} type="button" aria-pressed={nudgeAmount === amount} onClick={() => setNudgeAmount(amount)} className={joinClasses("min-h-11 min-w-11 rounded-md border px-3 text-xs font-semibold", nudgeAmount === amount ? "border-[#c7e58e] bg-[#2b3326] text-[#c7e58e]" : "border-white/15 text-[#d7d3c7]")}>{amount}s</button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Loop range controls">
                <button type="button" disabled={!hasValidLoop} onClick={halveLoop} className={pedalButton}>Halve</button>
                <button type="button" disabled={!hasValidLoop} onClick={doubleLoop} className={pedalButton}>Double</button>
                <button type="button" onClick={clearBoundaries} className={joinClasses(pedalButton, "text-[#ffb09f]")}>Clear</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Loop section navigation">
                <button type="button" disabled={!canShiftPrevious} onClick={() => shiftSection("previous")} className={pedalButton}>Previous section</button>
                <button type="button" disabled={!canShiftNext} onClick={() => shiftSection("next")} className={pedalButton}>Next section</button>
              </div>
            </section>

            {saveError ? <p role="alert" className="mt-3 text-sm text-[#ff9b87]">{saveError}</p> : null}
            {saveMessage ? (
              <div className="mt-3 flex flex-wrap items-center gap-3" aria-live="polite">
                <p className="text-sm text-[#dce9c7]">{saveMessage}</p>
                {deletedLoop ? <button type="button" className="text-sm underline" onClick={undoDelete} disabled={isPending}>{isPending ? "Restoring…" : "Undo"}</button> : null}
              </div>
            ) : null}
          </section>
  )

  return (
    <>
      <div
        className={joinClasses(
          presentation === "session" ? "practice-reference-workbench" : "reference-workbench min-w-0 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,1fr)] md:items-start md:gap-6",
          className
        )}
      >
        <section className="reference-player flex min-w-0 flex-col md:sticky md:top-6">
          {playerError ? (
            <div className="border-y border-hairline py-5">
              <p className="font-semibold text-foreground">Recording unavailable</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {playerError} {presentation === "session" ? mediaPanel ? "Open Loop pedal to choose another recording, or open the source directly." : "You can open the source directly or continue practising." : "Choose another recording below, or open the source directly."}
              </p>
              <a href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`} target="_blank" rel="noopener noreferrer" className={`${buttonStyles.secondary} mt-4`}>
                Open on YouTube
              </a>
            </div>
          ) : null}
          <div className={joinClasses("aspect-video w-full overflow-hidden rounded-2xl border border-border bg-foreground/10 shadow-sm", playerError && "hidden")}>
            <div ref={containerRef} title={title} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />
          </div>
        </section>

        {presentation === "workspace" ? <aside className="mt-5 min-w-0 space-y-4 md:mt-0">
          {pedal}

          {mediaPanel}
        </aside> : null}
      </div>

      {presentation === "session" ? (
        <>
          <div className="practice-player-controls">
            <button type="button" aria-label={isPlaying ? "Pause reference" : "Play reference"} disabled={!isReady || Boolean(playerError)} aria-pressed={isPlaying} onClick={() => isPlaying ? playerRef.current?.pauseVideo?.() : playFrom()} className="practice-player-play">{isPlaying ? "Pause" : "Play"}</button>
            <button type="button" disabled={!hasValidLoop || Boolean(playerError)} aria-pressed={hasValidLoop && loopEnabled} onClick={() => setLoopEnabled(value => !value)} className="practice-loop-status"><span aria-hidden="true" className={hasValidLoop && loopEnabled ? "bg-state-known" : "bg-text-muted/40"} />{hasValidLoop ? loopEnabled ? "Loop on" : "Loop off" : "No loop set"}</button>
            <button type="button" aria-haspopup="dialog" onClick={() => setPedalOpen(true)} className="practice-pedal-trigger">Loop pedal <span aria-hidden="true">↗</span></button>
          </div>
          <ResponsiveModal isOpen={pedalOpen} onClose={() => setPedalOpen(false)} title="Loop pedal" desktopPlacement="side" desktopMaxWidth="md:max-w-2xl" closeLabel="Done" closeDisabled={isSaveModalOpen || loadingBankIndex !== null}>
            {pedal}
            {mediaPanel ? <div className="mt-5">{mediaPanel}</div> : null}
          </ResponsiveModal>
        </>
      ) : null}

      <ResponsiveModal
        isOpen={loadingBankIndex !== null}
        onClose={() => setLoadingBankIndex(null)}
        title={`Load bank ${loadingBankIndex === null ? "" : loopBanks[loadingBankIndex]?.key ?? ""}`.trim()}
        description="Choose a saved loop for this bank."
      >
        {loops.length > 0 ? (
          <div className="grid gap-2">
            {loops.map((loop) => (
              <button key={loop.id} type="button" onClick={() => loadLoopIntoBank(loop)} className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3 text-left transition hover:border-foreground/30 hover:bg-muted/50">
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-foreground">{loop.label}</span>
                  <span className="mt-0.5 block font-mono text-xs text-muted-foreground">{formatTime(Number(loop.start_seconds), true)}–{formatTime(Number(loop.end_seconds), true)}</span>
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">{Math.round(Number(loop.playback_rate) * 100)}%</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No saved loops yet. Mark a loop and use Save Loop first.</p>
        )}
      </ResponsiveModal>

      <ResponsiveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        closeDisabled={isPending}
        title={activeLoop ? `Update loop ${activeBank.key}` : `Save loop ${activeBank.key}`}
        description={`${formatTime(loopStart, true)}–${formatTime(loopEnd, true)} at ${Math.round(playbackRate * 100)}% speed`}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block text-sm font-semibold">Loop name
            <input value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} placeholder={`Loop ${activeBank.key}`} aria-label="Loop name" className="mt-1 w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--focus-ring)]" required autoFocus />
          </label>
          <label className="block text-sm font-semibold">Note <span className="font-normal text-muted-foreground">(optional)</span>
            <textarea value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} placeholder="What should you focus on?" aria-label="Loop note" rows={3} className="mt-1 w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--focus-ring)]" />
          </label>
          {saveError ? <p role="alert" className="text-sm font-medium text-destructive">{saveError}</p> : null}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={buttonStyles.primary} disabled={isPending || !hasValidLoop || !draftLabel.trim()}>{isPending ? "Saving…" : activeLoop ? "Save changes" : "Save loop"}</button>
            <button type="button" className={buttonStyles.secondary} onClick={() => setIsSaveModalOpen(false)} disabled={isPending}>Cancel</button>
            {activeLoop ? <button type="button" className={`${buttonStyles.destructiveSecondary} sm:ml-auto`} onClick={handleDelete} disabled={isPending}>Delete saved loop</button> : null}
          </div>
        </form>
      </ResponsiveModal>
    </>
  )
}

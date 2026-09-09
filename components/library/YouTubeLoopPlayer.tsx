"use client"

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
import MobileViewSwitcher from "@/components/ui/MobileViewSwitcher"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
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
  nudgeLoopBoundary,
  resizeLoopWindow,
  selectSavedLoopWindow,
  setLoopEndAtPlayhead,
  setLoopStartAtPlayhead,
  shiftLoopWindow,
  startNewSectionDraft,
  type LoopPlaybackState,
} from "@/components/library/youtube-loop-state"

export type YouTubePlayer = {
  destroy: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getAvailablePlaybackRates?: () => number[]
  getPlaybackRate?: () => number
  setPlaybackRate: (rate: number) => void
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
const mobileViews = [
  { id: "media", label: "Media" },
  { id: "sections", label: "Sections" },
  { id: "practice", label: "Practice" },
] as const

type NudgeAmount = (typeof NUDGE_AMOUNTS)[number]
type MarkingStage = "idle" | "draft" | "ready"

let youtubeApiPromise: Promise<void> | null = null

export function loadYouTubeIframeApi() {
  if (typeof window === "undefined" || window.YT?.Player) {
    return Promise.resolve()
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReadyHandler = window.onYouTubeIframeAPIReady

      window.onYouTubeIframeAPIReady = () => {
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

function compactButton(className: string) {
  return joinClasses(className, "px-3 py-2 text-xs sm:px-4 sm:text-sm")
}

function readPlaybackSnapshot(storageKey: string) {
  try {
    const parsed = JSON.parse(
      window.sessionStorage.getItem(storageKey) ?? "null"
    ) as Partial<YouTubePlaybackSnapshot> | null
    if (!parsed) return null

    const mobileView = mobileViews.some((view) => view.id === parsed.mobileView)
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
}: YouTubeLoopPlayerProps) {
  const playbackStorageKey = `tunes.session.v1.reference.${pieceId}.${videoId}`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const restoredSnapshotRef = useRef<YouTubePlaybackSnapshot | null>(null)
  const saveInFlightRef = useRef(false)
  const lastPlaybackTimeRef = useRef(0)
  const [mobileView, setMobileView] =
    useState<ReferencePracticeView>("media")
  const [loops, setLoops] = useState(() => sortLoops(savedLoops))
  const [activeLoopId, setActiveLoopId] = useState<number | null>(null)
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
  const [isEditing, setIsEditing] = useState(false)
  const [nudgeAmount, setNudgeAmount] = useState<NudgeAmount>(0.5)
  const [draftLabel, setDraftLabel] = useState("")
  const [draftNotes, setDraftNotes] = useState("")
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletedLoop, setDeletedLoop] = useState<UserPieceMediaLoop | null>(null)
  const [passagePracticeActive, setPassagePracticeActive] = useState(false)
  const [isPending, startTransition] = useTransition()

  const activeLoop =
    loops.find((loop) => loop.id === activeLoopId) ?? null
  const hasValidLoop =
    loopStart !== null && loopEnd !== null && loopEnd > loopStart + 0.2
  const activeLoopIndex = activeLoop
    ? loops.findIndex((loop) => loop.id === activeLoop.id)
    : -1
  const loopPlaybackState: LoopPlaybackState = {
    currentTime,
    isPlaying,
    playbackRate,
    loopStart,
    loopEnd,
    loopEnabled,
  }
  const previousLoopWindow = shiftLoopWindow(
    loopPlaybackState,
    "previous",
    duration
  )
  const nextLoopWindow = shiftLoopWindow(
    loopPlaybackState,
    "next",
    duration
  )

  function applyLoopWindow(state: LoopPlaybackState) {
    setLoopStart(state.loopStart)
    setLoopEnd(state.loopEnd)
    setLoopEnabled(state.loopEnabled)
  }

  function getLiveLoopPlaybackState(): LoopPlaybackState {
    return {
      currentTime: getPlayerTime(playerRef.current),
      isPlaying,
      playbackRate,
      loopStart,
      loopEnd,
      loopEnabled,
    }
  }

  const resetPassageState = useCallback(() => {
    setActiveLoopId(null)
    setLoopStart(null)
    setLoopEnd(null)
    setLoopEnabled(false)
    setMarkingStage("idle")
    setIsEditing(false)
    setDraftLabel("")
    setDraftNotes("")
    setSaveMessage(null)
    setSaveError(null)
    setPassagePracticeActive(false)
  }, [])

  useEffect(() => {
    setLoops(sortLoops(savedLoops))
  }, [savedLoops, videoId])

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current

    if (!container) return

    const restoredSnapshot = readPlaybackSnapshot(playbackStorageKey)
    restoredSnapshotRef.current = restoredSnapshot
    setIsReady(false)
    setPlayerError(null)
    setCurrentTime(restoredSnapshot?.currentTime ?? 0)
    lastPlaybackTimeRef.current = restoredSnapshot?.currentTime ?? 0
    setDuration(0)
    setIsPlaying(false)
    setPlaybackRateState(restoredSnapshot?.playbackRate ?? 1)
    setAvailableRates(DEFAULT_SPEEDS)
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

      const player = new window.YT.Player(container, {
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
              event.target.seekTo(restored.currentTime, true)
              try {
                event.target.setPlaybackRate(restored.playbackRate)
              } catch {
                setPlaybackRateState(1)
              }
            }
            setIsReady(true)
          },
          onStateChange: (event) => {
            const playingState = window.YT?.PlayerState?.PLAYING
            setIsPlaying(
              playingState !== undefined && event.data === playingState
            )
          },
          onError: () => {
            setIsReady(false)
            setIsPlaying(false)
            setPlayerError("This recording is unavailable in the player.")
          },
        },
      })

      playerRef.current = player
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
    }
  }, [playbackStorageKey, resetPassageState, videoId])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const player = playerRef.current
      const nextTime = getPlayerTime(player)
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
    window.sessionStorage.setItem(
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
  ])

  const setPlaybackRate = useCallback((rate: number) => {
    try {
      playerRef.current?.setPlaybackRate(rate)
      setPlaybackRateState(rate)
    } catch {
      // Keep the accepted YouTube rate when this recording rejects a value.
    }
  }, [])

  const playFrom = useCallback((seconds?: number) => {
    const player = playerRef.current
    if (!player) return

    if (seconds !== undefined) player.seekTo(seconds, true)
    player.playVideo()
  }, [])

  function selectWholeRecording() {
    resetPassageState()
    setMobileView("sections")
  }

  function selectLoop(loop: UserPieceMediaLoop) {
    const start = Number(loop.start_seconds)
    const end = Number(loop.end_seconds)
    const rate = Number(loop.playback_rate)

    const selectedState = selectSavedLoopWindow(
      getLiveLoopPlaybackState(),
      { startSeconds: start, endSeconds: end, playbackRate: rate }
    )

    if (!selectedState) return

    setActiveLoopId(loop.id)
    applyLoopWindow(selectedState)
    setMarkingStage("idle")
    setIsEditing(false)
    setDraftLabel(loop.label)
    setDraftNotes(loop.notes ?? "")
    setSaveMessage(null)
    setSaveError(null)
    setDeletedLoop(null)
    if (selectedState.playbackRate !== playbackRate) {
      setPlaybackRate(selectedState.playbackRate)
    }
  }

  function startNewSection() {
    const draftState = startNewSectionDraft(getLiveLoopPlaybackState())

    setActiveLoopId(null)
    applyLoopWindow(draftState)
    setMarkingStage("draft")
    setIsEditing(false)
    setDraftLabel("")
    setDraftNotes("")
    setSaveMessage(null)
    setSaveError(null)
    setDeletedLoop(null)
    setMobileView("practice")
  }

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

  function setDraftLoopStart() {
    const nextState = setLoopStartAtPlayhead(getLiveLoopPlaybackState())
    applyLoopWindow(nextState)
    setMarkingStage(nextState.loopEnd === null ? "draft" : "ready")
    setSaveError(null)
  }

  function setDraftLoopEnd() {
    const result = setLoopEndAtPlayhead(getLiveLoopPlaybackState())

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
  }

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

  function moveLoopWindow(direction: "previous" | "next") {
    const nextState = shiftLoopWindow(
      getLiveLoopPlaybackState(),
      direction,
      duration
    )

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
        setMarkingStage("idle")
        setIsEditing(false)
        setDeletedLoop(null)
        setSaveMessage(activeLoop ? "Section updated" : "Section saved")
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
      const result = await deleteMediaLoopInPlace(formData)

      if (!result.ok) {
        setSaveError(result.error)
        return
      }

      setLoops((current) => current.filter((loop) => loop.id !== loopToDelete.id))
      setDeletedLoop(loopToDelete)
      resetPassageState()
      setSaveMessage("Passage deleted")
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
      const result = await createMediaLoopInPlace(formData)

      if (!result.ok || !result.loop) {
        setSaveError(result.ok ? "Couldn’t restore this passage." : result.error)
        return
      }

      setLoops((current) => sortLoops([...current, result.loop]))
      setDeletedLoop(null)
      setSaveMessage("Passage restored")
    })
  }

  function openEditor() {
    if (!activeLoop) return
    setDraftLabel(activeLoop.label)
    setDraftNotes(activeLoop.notes ?? "")
    setIsEditing(true)
    setMobileView("practice")
  }

  const mediaPanelClassName = joinClasses(
    "order-3 mt-4 md:order-1 md:mt-0",
    mobileView === "media" ? "block" : "hidden md:block"
  )
  const sectionsPanelClassName = joinClasses(
    mobileView === "sections" ? "block" : "hidden md:block"
  )
  const practicePanelClassName = joinClasses(
    mobileView === "practice" ? "block" : "hidden md:block"
  )

  const dockModel = useMemo<SessionDockModel>(() => {
    const availableIndex = availableRates.indexOf(playbackRate)
    const nextRate =
      availableRates[(availableIndex + 1) % availableRates.length] ?? 1
    const sectionLabel = activeLoop?.label ?? "Whole recording"

    return {
      id: `reference-media:${pieceId}:${videoId}`,
      context: "reference-media",
      identity: {
        eyebrow: passagePracticeActive ? "Passage practice" : "Reference",
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
          id: "speed",
          label: `${playbackRate}×`,
          ariaLabel: `Playback speed ${playbackRate}. Change to ${nextRate}.`,
          disabled: !isReady,
          onInvoke: () => setPlaybackRate(nextRate),
          tone: "secondary",
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
        actionIds: ["playback", "loop"],
        showProgress: true,
      },
      expandedContent: {
        title: `${recordingLabel} controls`,
        description:
          "Playback, loop, speed, saved passages and the metronome stay attached to this recording.",
        actionIds: ["playback", "loop", "speed", "practice", "section"],
        tools: ["metronome"],
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
    availableRates,
    currentTime,
    duration,
    endPassagePractice,
    hasValidLoop,
    isPlaying,
    isReady,
    loopEnabled,
    passagePracticeActive,
    pieceId,
    playbackRate,
    playbackStorageKey,
    playFrom,
    recordingLabel,
    setPlaybackRate,
    startPassagePractice,
    videoId,
  ])

  useSessionDock(`reference-media:${pieceId}`, dockModel)

  return (
    <div
      className={joinClasses(
        "min-w-0 md:grid md:grid-cols-[minmax(0,0.92fr)_minmax(22rem,1.08fr)] md:items-start md:gap-6",
        className
      )}
    >
      <section className="flex min-w-0 flex-col md:sticky md:top-24">
        <div className={mediaPanelClassName}>{mediaPanel}</div>

        <div className="order-1 mt-4 md:order-2">
          {playerError ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-semibold text-foreground">Recording unavailable</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {playerError} Choose another recording above, or open the source
                directly.
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonStyles.secondary} mt-4`}
              >
                Open on YouTube
              </a>
            </div>
          ) : null}
          <div
            className={joinClasses(
              "aspect-video w-full overflow-hidden rounded-2xl border border-border bg-foreground/10 shadow-sm",
              playerError && "hidden"
            )}
          >
            <div ref={containerRef} title={title} className="h-full w-full" />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <p className="min-w-0 truncate font-medium text-foreground">
              {recordingLabel}
            </p>
            <p className="shrink-0 tabular-nums text-muted-foreground">
              {formatTime(currentTime)}
              {duration > 0 ? ` / ${formatTime(duration)}` : ""}
            </p>
          </div>
        </div>

        <MobileViewSwitcher
          value={mobileView}
          options={mobileViews}
          onChange={setMobileView}
          label="View"
          className="order-2 mt-3 md:hidden"
        />
      </section>

      <aside className="mt-5 min-w-0 space-y-5 md:mt-0">
        <section
          className={joinClasses(
            "min-w-0 border-y border-border/70 py-4 md:rounded-3xl md:border md:bg-card md:p-5 md:shadow-sm",
            sectionsPanelClassName
          )}
          aria-labelledby="saved-sections-heading"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Passages
              </p>
              <h2
                id="saved-sections-heading"
                className="mt-1 font-serif text-2xl font-bold text-foreground"
              >
                Saved passages
              </h2>
            </div>
            <button
              type="button"
              className={buttonStyles.primary}
              onClick={startNewSection}
              disabled={!isReady}
            >
              New passage
            </button>
          </div>

          <p className="sr-only">
            {duration > 0
              ? `${loops.length} saved passage${loops.length === 1 ? "" : "s"} across ${formatTime(duration)} of reliable provider timing.`
              : "Passage timing will appear when the provider reports a reliable duration."}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/80" aria-hidden="true">
            <div className="relative h-full">
              {duration > 0
                ? loops.map((loop) => {
                    const start = (Number(loop.start_seconds) / duration) * 100
                    const width =
                      ((Number(loop.end_seconds) - Number(loop.start_seconds)) /
                        duration) *
                      100

                    return (
                      <span
                        key={loop.id}
                        className={joinClasses(
                          "absolute h-full min-w-1 rounded-full",
                          loop.id === activeLoopId ? "bg-primary" : "bg-border"
                        )}
                        style={{ left: `${start}%`, width: `${Math.max(width, 1)}%` }}
                      />
                    )
                  })
                : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" aria-label="Saved passages">
            <button
              type="button"
              onClick={selectWholeRecording}
              className={joinClasses(
                "inline-flex min-h-11 items-center gap-2 rounded-pill border px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                activeLoopId === null && markingStage === "idle"
                  ? "border-action-primary bg-action-primary text-action-primary-foreground"
                  : "border-hairline bg-surface-paper text-text-muted"
              )}
            >
              <span>Whole recording</span>
              {activeLoopId === null && markingStage === "idle" ? (
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                  Active
                </span>
              ) : null}
            </button>

            {loops.map((loop) => {
              const isActive = loop.id === activeLoopId
              return (
                <button
                  key={loop.id}
                  type="button"
                  onClick={() => selectLoop(loop)}
                  aria-current={isActive ? "true" : undefined}
                  className={joinClasses(
                    "inline-flex min-h-11 max-w-full items-center gap-2 rounded-pill border px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                    isActive
                      ? "border-action-primary bg-action-primary text-action-primary-foreground"
                      : "border-hairline bg-surface-paper text-text-muted"
                  )}
                >
                  <span className="max-w-44 truncate font-semibold">{loop.label}</span>
                  <span className="shrink-0 tabular-nums opacity-80">
                    {formatTime(
                      Number(loop.end_seconds) - Number(loop.start_seconds),
                      true
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {activeLoop?.notes ? (
            <p className="mt-3 border-l-4 border-state-reference pl-3 text-sm leading-6 text-text-muted">
              {activeLoop.notes}
            </p>
          ) : null}

          {loops.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No saved passages for this recording yet. Mark a passage to make
              focused practice quicker next time.
            </p>
          ) : null}

          {activeLoop ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonStyles.secondary}
                disabled={activeLoopIndex <= 0}
                onClick={() => selectLoop(loops[activeLoopIndex - 1])}
              >
                Previous
              </button>
              <button
                type="button"
                className={buttonStyles.secondary}
                disabled={activeLoopIndex < 0 || activeLoopIndex >= loops.length - 1}
                onClick={() => selectLoop(loops[activeLoopIndex + 1])}
              >
                Next
              </button>
              <button
                type="button"
                className={buttonStyles.primary}
                onClick={startPassagePractice}
              >
                Practise this passage
              </button>
            </div>
          ) : null}
        </section>

        <section
          className={joinClasses(
            "min-w-0 border-y border-border/70 py-4 md:rounded-3xl md:border md:bg-card md:p-5 md:shadow-sm",
            practicePanelClassName
          )}
          aria-labelledby="practice-controls-heading"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Practice
          </p>
          <h2
            id="practice-controls-heading"
            className="mt-1 font-serif text-2xl font-bold text-foreground"
          >
            {markingStage !== "idle"
              ? "New passage"
              : activeLoop?.label ?? "Whole recording"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasValidLoop
              ? `${formatTime(loopStart, true)}–${formatTime(loopEnd, true)}`
              : markingStage === "draft"
                ? `Start ${formatTime(loopStart, true)} · End not set`
                : "No section boundaries active"}
          </p>

          {passagePracticeActive && activeLoop ? (
            <div className="mt-4 border-l-4 border-state-reference bg-surface-note px-4 py-3">
              <p className="font-semibold text-text-primary">Passage practice active</p>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                This loops “{activeLoop.label}” for focused repetition. It does not
                change this tune&apos;s Stage or complete a review.
              </p>
              <button
                type="button"
                className={`${buttonStyles.text} mt-2`}
                onClick={endPassagePractice}
              >
                End passage practice
              </button>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              className={isPlaying ? buttonStyles.secondaryStrong : buttonStyles.primary}
              onClick={() => {
                if (isPlaying) playerRef.current?.pauseVideo?.()
                else playFrom()
              }}
              disabled={!isReady}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className={loopEnabled ? buttonStyles.primary : buttonStyles.secondary}
              onClick={() => setLoopEnabled((current) => !current)}
              disabled={!hasValidLoop}
              aria-pressed={loopEnabled}
            >
              {loopEnabled ? "Loop on" : "Loop off"}
            </button>
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={resetPassageState}
              disabled={!hasValidLoop}
            >
              Clear Loop
            </button>
            <button
              type="button"
              className={buttonStyles.secondaryStrong}
              onClick={() => playFrom(loopStart ?? 0)}
              disabled={!isReady || loopStart === null}
            >
              Play from start
            </button>
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={() => moveLoopWindow("previous")}
              disabled={!previousLoopWindow}
            >
              Previous section
            </button>
            <button
              type="button"
              className={buttonStyles.secondary}
              onClick={() => moveLoopWindow("next")}
              disabled={!nextLoopWindow}
            >
              Next section
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Speed
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DEFAULT_SPEEDS.map((rate) => (
                <button
                  key={rate}
                  type="button"
                  className={compactButton(
                    playbackRate === rate
                      ? buttonStyles.primary
                      : buttonStyles.secondary
                  )}
                  onClick={() => setPlaybackRate(rate)}
                  disabled={!isReady || !availableRates.includes(rate)}
                  aria-pressed={playbackRate === rate}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {markingStage === "draft" || markingStage === "ready" ? (
            <div className="mt-5 border-t border-border pt-5">
              <p className="text-sm leading-6 text-muted-foreground">
                The loop starts at {formatTime(loopStart, true)}. Keep that
                start, or replace it at the current playhead before setting the
                end.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={buttonStyles.secondaryStrong}
                  onClick={setDraftLoopStart}
                  disabled={!isReady}
                >
                  Set loop start
                </button>
                <button
                  type="button"
                  className={buttonStyles.primary}
                  onClick={setDraftLoopEnd}
                  disabled={!isReady}
                >
                  Set loop end
                </button>
              </div>
            </div>
          ) : null}

          {activeLoop && !isEditing && markingStage === "idle" ? (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
              <button
                type="button"
                className={buttonStyles.secondaryStrong}
                onClick={openEditor}
              >
                Manage passage
              </button>
            </div>
          ) : null}

          {(markingStage === "ready" || isEditing) && hasValidLoop ? (
            <form onSubmit={handleSave} className="mt-5 space-y-4 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {isEditing ? "Edit passage" : "Name this passage"}
                </p>
                <button
                  type="button"
                  className={buttonStyles.text}
                  onClick={() => setIsEditing((current) => !current)}
                  aria-expanded={isEditing}
                >
                  {isEditing ? "Hide adjustment" : "Adjust section"}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4 rounded-2xl border border-border bg-background/45 p-3">
                  <div className="flex flex-wrap gap-2">
                    {NUDGE_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        className={compactButton(
                          nudgeAmount === amount
                            ? buttonStyles.primary
                            : buttonStyles.secondary
                        )}
                        onClick={() => setNudgeAmount(amount)}
                      >
                        {amount}s
                      </button>
                    ))}
                  </div>

                  {(["start", "end"] as const).map((boundary) => (
                    <div key={boundary} className="grid grid-cols-[4rem_1fr_1fr] items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {boundary}
                      </p>
                      <button
                        type="button"
                        className={compactButton(buttonStyles.secondary)}
                        onClick={() => adjustBoundary(boundary, -nudgeAmount)}
                      >
                        -{nudgeAmount}s
                      </button>
                      <button
                        type="button"
                        className={compactButton(buttonStyles.secondary)}
                        onClick={() => adjustBoundary(boundary, nudgeAmount)}
                      >
                        +{nudgeAmount}s
                      </button>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <button type="button" className={buttonStyles.secondary} onClick={halveLoop}>
                      Halve loop
                    </button>
                    <button type="button" className={buttonStyles.secondary} onClick={doubleLoop}>
                      Double loop
                    </button>
                    <button type="button" className={buttonStyles.text} onClick={clearBoundaries}>
                      Clear boundaries
                    </button>
                  </div>
                </div>
              ) : null}

              <input
                value={draftLabel}
                onChange={(event) => setDraftLabel(event.target.value)}
                placeholder="Label, eg B part"
                aria-label="Passage label"
                className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                required
              />
              <textarea
                value={draftNotes}
                onChange={(event) => setDraftNotes(event.target.value)}
                placeholder="Optional note"
                aria-label="Passage note"
                rows={3}
                className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />

              {saveError ? (
                <p className="text-sm font-medium text-destructive">{saveError}</p>
              ) : null}
              <button
                type="submit"
                className={buttonStyles.primary}
                disabled={isPending || !hasValidLoop || !draftLabel.trim()}
              >
                {isPending
                  ? "Saving…"
                  : activeLoop
                    ? "Save changes"
                    : "Save passage"}
              </button>
              {activeLoop ? (
                <button
                  type="button"
                  className={buttonStyles.destructiveSecondary}
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  Delete passage
                </button>
              ) : null}
            </form>
          ) : null}

          {saveMessage ? (
            <div className="mt-4 flex flex-wrap items-center gap-3" aria-live="polite">
              <p className="text-sm font-medium text-foreground">{saveMessage}</p>
              {deletedLoop ? (
                <button
                  type="button"
                  className={buttonStyles.text}
                  onClick={undoDelete}
                  disabled={isPending}
                >
                  {isPending ? "Restoring…" : "Undo"}
                </button>
              ) : null}
            </div>
          ) : null}
          {saveError && markingStage !== "ready" && !isEditing ? (
            <p className="mt-4 text-sm font-medium text-destructive" role="alert">
              {saveError}
            </p>
          ) : null}
        </section>
      </aside>
    </div>
  )
}

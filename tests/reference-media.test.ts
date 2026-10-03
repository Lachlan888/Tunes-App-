import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import {
  chooseReferenceMediaSource,
  getReferencePracticeHref,
  groupReferenceSectionsByMediaId,
  listReferenceMediaSources,
  safeReferenceReturn,
} from "../lib/reference-media-routing.ts"
import {
  createLoopBanks,
  crossedLoopEnd,
  loadSavedLoopIntoBank,
  loopResumePosition,
  nudgeLoopBoundary,
  resizeLoopWindow,
  selectSavedLoopWindow,
  setLoopEndAtPlayhead,
  setLoopStartAtPlayhead,
  shiftLoopWindow,
  startNewSectionDraft,
  type LoopPlaybackState,
} from "../components/library/youtube-loop-state.ts"

const canonical = {
  id: "canonical-42",
  url: "https://www.youtube.com/watch?v=canonical",
}

test("loop resume returns to start after shortening the end or seeking outside", () => {
  assert.equal(loopResumePosition(26, 0, 8.5, true), 0)
  assert.equal(loopResumePosition(8.5, 0, 8.5, true), 0)
  assert.equal(loopResumePosition(2, 5, 8.5, true), 5)
  assert.equal(loopResumePosition(6, 5, 8.5, true), 6)
  assert.equal(loopResumePosition(26, 0, 8.5, false), 26)
  assert.equal(loopResumePosition(26, 0, null, true), 26)
  assert.equal(loopResumePosition(26, 5, 4, true), 26)
})
const additional = [
  { id: "media-7", url: "https://www.youtube.com/watch?v=first" },
  { id: "media-8", url: "https://www.youtube.com/watch?v=second" },
]

const playingState: LoopPlaybackState = {
  currentTime: 24.5,
  isPlaying: true,
  playbackRate: 0.75,
  loopStart: 20,
  loopEnd: 30,
  loopEnabled: true,
}

test("new sections start at zero without changing playback transport", () => {
  const draft = startNewSectionDraft(playingState)

  assert.equal(draft.loopStart, 0)
  assert.equal(draft.loopEnd, null)
  assert.equal(draft.loopEnabled, false)
  assert.equal(draft.currentTime, playingState.currentTime)
  assert.equal(draft.isPlaying, true)
  assert.equal(draft.playbackRate, playingState.playbackRate)
})

test("a new section can set its end while retaining the default zero start", () => {
  const draft = startNewSectionDraft({ ...playingState, currentTime: 0 })
  const result = setLoopEndAtPlayhead({ ...draft, currentTime: 12.4 })

  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal(result.state.loopStart, 0)
  assert.equal(result.state.loopEnd, 12.4)
  assert.equal(result.state.loopEnabled, true)
  assert.equal(result.state.currentTime, 12.4)
  assert.equal(result.state.isPlaying, true)
})

test("four loop banks default to A and retain saved names beside temporary slots", () => {
  const banks = createLoopBanks([
    {
      id: 14,
      label: "Verse riff",
      start_seconds: 12.5,
      end_seconds: 18.75,
      playback_rate: 0.75,
    },
  ])

  assert.deepEqual(banks.map((bank) => bank.key), ["A", "B", "C", "D"])
  assert.deepEqual(banks[0], {
    key: "A",
    savedLoopId: 14,
    name: "Verse riff",
    startSeconds: 12.5,
    endSeconds: 18.75,
    playbackRate: 0.75,
    dirty: false,
  })
  assert.equal(banks[1].name, "Empty")
  assert.equal(banks[1].savedLoopId, null)
})

test("a saved loop can be loaded into a chosen bank without changing the others", () => {
  const banks = createLoopBanks([])
  const loaded = loadSavedLoopIntoBank(banks, 2, {
    id: 21,
    label: "Bridge run",
    start_seconds: "42.5",
    end_seconds: "49.25",
    playback_rate: "0.5",
  })

  assert.equal(loaded[0].name, "Empty")
  assert.deepEqual(loaded[2], {
    key: "C",
    savedLoopId: 21,
    name: "Bridge run",
    startSeconds: 42.5,
    endSeconds: 49.25,
    playbackRate: 0.5,
    dirty: false,
  })
})

test("setting or revising the start does not seek or pause playback", () => {
  const next = setLoopStartAtPlayhead({
    ...playingState,
    currentTime: 7.25,
    loopStart: 0,
    loopEnd: null,
    loopEnabled: false,
  })

  assert.equal(next.loopStart, 7.25)
  assert.equal(next.currentTime, 7.25)
  assert.equal(next.isPlaying, true)
})

test("saved selection and boundary edits preserve the playhead", () => {
  const selected = selectSavedLoopWindow(playingState, {
    startSeconds: 40,
    endSeconds: 50,
    playbackRate: 0.5,
  })

  assert.ok(selected)
  assert.equal(selected.currentTime, 24.5)
  assert.equal(selected.isPlaying, true)

  const nudged = nudgeLoopBoundary(selected, "start", 0.5, 120)
  const halved = resizeLoopWindow(nudged, "halve", 120)
  const doubled = resizeLoopWindow(halved, "double", 120)

  assert.equal(nudged.currentTime, 24.5)
  assert.equal(halved.currentTime, 24.5)
  assert.equal(doubled.currentTime, 24.5)
  assert.equal(doubled.isPlaying, true)
})

test("only a genuine forward crossing of the active end loops playback", () => {
  assert.equal(crossedLoopEnd(29.8, 30.1, 30), true)
  assert.equal(crossedLoopEnd(35, 35.2, 30), false)
  assert.equal(crossedLoopEnd(31, 29, 30), false)
  assert.equal(crossedLoopEnd(24, 29.9, 30), false)
})

test("next and previous shift an equal loop window without moving playback", () => {
  const next = shiftLoopWindow(playingState, "next", 120)
  const previous = shiftLoopWindow(playingState, "previous", 120)

  assert.deepEqual(
    next && [next.loopStart, next.loopEnd],
    [30, 40]
  )
  assert.deepEqual(
    previous && [previous.loopStart, previous.loopEnd],
    [10, 20]
  )

  for (const shifted of [next, previous]) {
    assert.equal(shifted?.currentTime, playingState.currentTime)
    assert.equal(shifted?.isPlaying, playingState.isPlaying)
    assert.equal(shifted?.playbackRate, playingState.playbackRate)
    assert.equal(shifted?.loopEnabled, playingState.loopEnabled)
  }

  assert.equal(
    shiftLoopWindow({ ...playingState, loopStart: 0, loopEnd: 10 }, "previous", 120),
    null
  )
  assert.equal(
    shiftLoopWindow({ ...playingState, loopStart: 110, loopEnd: 120 }, "next", 120),
    null
  )
})

test("playback continues into an advanced window and loops only at its new end", () => {
  const advanced = shiftLoopWindow(playingState, "next", 120)
  assert.ok(advanced)
  assert.equal(crossedLoopEnd(24.5, 35, advanced.loopEnd!), false)
  assert.equal(crossedLoopEnd(39.8, 40.1, advanced.loopEnd!), true)
})

test("all tune recordings retain stable ordering and identity", () => {
  const sources = listReferenceMediaSources({
    canonical,
    additional,
    preferred: {
      id: "preferred-42",
      url: "https://www.youtube.com/watch?v=first",
    },
  })

  assert.deepEqual(
    sources.map((source) => source.id),
    ["canonical-42", "media-7", "media-8"]
  )
})

test("URL selection wins, then the established effective recording, then first", () => {
  const sources = [canonical, ...additional]

  assert.equal(
    chooseReferenceMediaSource({
      sources,
      requestedSourceId: "media-8",
      effectiveUrl: canonical.url,
    })?.id,
    "media-8"
  )
  assert.equal(
    chooseReferenceMediaSource({
      sources,
      requestedSourceId: "missing",
      effectiveUrl: additional[0].url,
    })?.id,
    "media-7"
  )
  assert.equal(
    chooseReferenceMediaSource({ sources, requestedSourceId: "missing" })?.id,
    "canonical-42"
  )
})

test("external and missing reference sources retain honest recovery states", () => {
  const external = {
    id: "media-external",
    url: "https://example.com/session-recording.mp3",
  }

  assert.equal(
    chooseReferenceMediaSource({ sources: [external] })?.id,
    "media-external"
  )
  assert.equal(chooseReferenceMediaSource({ sources: [] }), null)
})

test("recording switches use replaceable media URLs with tune identity", () => {
  assert.equal(
    getReferencePracticeHref(42, "media-8"),
    "/library/42/reference-media?media=media-8"
  )
})

test("full reference returns only to safe review or tune contexts", () => {
  const context = "/review?lane=catch-up&focus=12#review-reference"
  assert.equal(safeReferenceReturn(context), context)
  const href = new URL(getReferencePracticeHref(42, "media-8", context), "https://tunes.invalid")
  assert.equal(href.searchParams.get("return_to"), context)
  assert.equal(href.searchParams.get("media"), "media-8")
  for (const unsafe of ["//evil.example", "https://evil.example", "/\\evil.example", "/library/42?view=reference", "/library/42/reference-media", "/login", "/review\n"]) {
    assert.equal(safeReferenceReturn(unsafe), null, unsafe)
    assert.equal(getReferencePracticeHref(42, null, unsafe), "/library/42/reference-media")
  }
})

test("existing saved sections remain isolated by recording provider identity", () => {
  const sections = groupReferenceSectionsByMediaId([
    { id: 1, youtube_video_id: "first", notes: "Slow this phrase" },
    { id: 2, youtube_video_id: "second", notes: "Different performance" },
    { id: 3, youtube_video_id: "first", notes: null },
  ])

  assert.deepEqual(
    sections.first.map((section) => section.id),
    [1, 3]
  )
  assert.deepEqual(
    sections.second.map((section) => section.id),
    [2]
  )
})

test("the route replaces modal wiring and keeps one persistent player and metronome", () => {
  const launcher = readFileSync(
    new URL("../components/reference-media/TuneMediaLauncher.tsx", import.meta.url),
    "utf8"
  )
  const workspace = readFileSync(
    new URL("../components/library/YouTubeLoopPlayer.tsx", import.meta.url),
    "utf8"
  )
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8")
  const shell = readFileSync(
    new URL("../components/layout/AppShell.tsx", import.meta.url),
    "utf8"
  )

  assert.match(launcher, /getReferencePracticeHref/)
  assert.doesNotMatch(launcher, /ReferenceMediaModal/)
  assert.match(workspace, />Loop In</)
  assert.match(workspace, />Loop Out</)
  assert.match(workspace, />Save Loop</)
  assert.doesNotMatch(workspace, />Transport</)
  assert.doesNotMatch(workspace, />Mark</)
  assert.doesNotMatch(workspace, />Keep</)
  assert.match(workspace, /createLoopBanks/)
  assert.match(workspace, /Load a saved loop into bank/)
  assert.match(workspace, /loadSavedLoopIntoBank/)
  assert.match(workspace, /title=\{`Load bank/)
  assert.match(workspace, /isSaveModalOpen/)
  assert.match(workspace, /<ResponsiveModal/)
  assert.doesNotMatch(workspace, /eyebrow=\{`Loop bank/)
  assert.doesNotMatch(workspace, /aria-label="Loop start seconds"/)
  assert.doesNotMatch(workspace, /aria-label="Loop end seconds"/)
  assert.match(workspace, /aria-label="Adjust loop in point"/)
  assert.match(workspace, /aria-label="Adjust loop out point"/)
  assert.match(workspace, /stepPlaybackRate\(-1\)/)
  assert.match(workspace, /aria-label=\{`Decrease \$\{control\.label\}`\}/)
  assert.doesNotMatch(workspace, />More</)
  assert.match(workspace, />Halve</)
  assert.match(workspace, />Double</)
  assert.match(workspace, />Clear</)
  assert.match(workspace, /transport:\s*\{/)
  assert.match(workspace, /actionIds:\s*\[[\s\S]*"playback"[\s\S]*"stop"[\s\S]*"loop-in"[\s\S]*"loop-out"[\s\S]*"save-loop"[\s\S]*"loop"/)
  assert.doesNotMatch(workspace, /aria-label="Playback transport"/)
  assert.match(
    workspace,
    /crossedLoopEnd\(previousTime, nextTime, loopEnd\)[\s\S]*player\.seekTo\(loopStart, true\)[\s\S]*player\.playVideo\(\)/
  )
  assert.match(workspace, /Loop pedal/)
  assert.equal((layout.match(/<PracticeMetronome/g) ?? []).length, 0)
  assert.equal((shell.match(/<PracticeMetronome variant="hidden"/g) ?? []).length, 1)
  assert.match(workspace, /context: "reference-media"/)
  assert.match(workspace, /passagePracticeActive/)
  assert.match(workspace, /Loop deleted/)
  assert.match(workspace, /Undo/)
  assert.match(workspace, /sessionStorage/)
})

test("Reference Mode has route-level loading and recovery states", () => {
  const loading = readFileSync(
    new URL("../app/library/[id]/reference-media/loading.tsx", import.meta.url),
    "utf8"
  )
  const error = readFileSync(
    new URL("../app/library/[id]/reference-media/error.tsx", import.meta.url),
    "utf8"
  )

  assert.match(loading, /Opening the recording workspace/)
  assert.match(loading, /saved passages/)
  assert.match(error, /Reference Mode could not be opened/)
  assert.match(error, /onPrimaryAction={reset}/)
})

test("recording and section mutations retain owner-scoped permissions", () => {
  const mediaActions = readFileSync(
    new URL("../lib/actions/media-links.ts", import.meta.url),
    "utf8"
  )
  const sectionActions = readFileSync(
    new URL("../lib/actions/media-loops.ts", import.meta.url),
    "utf8"
  )

  assert.match(mediaActions, /created_by: user\.id/)
  assert.match(mediaActions, /\.eq\("created_by", user\.id\)/)
  assert.match(sectionActions, /\.eq\("user_id", user\.id\)/)
  assert.match(sectionActions, /\.eq\("youtube_video_id", youtubeVideoId\)/)
})


test("section navigation clamps the start without shortening and rejects invalid windows", () => {
  const clamped = shiftLoopWindow({ ...playingState, loopStart: 2, loopEnd: 6 }, "previous", 120)
  assert.deepEqual(clamped, { ...playingState, loopStart: 0, loopEnd: 4 })
  for (const [loopStart, loopEnd] of [[null, null], [20, null], [24, 20], [20, 20], [-1, 4], [NaN, 24], [20, Infinity], [118, 122]]) {
    for (const direction of ["previous", "next"] as const) {
      assert.equal(shiftLoopWindow({ ...playingState, loopStart, loopEnd }, direction, 120), null)
    }
  }
  const state = { ...playingState, loopStart: 20, loopEnd: 24 }
  assert.deepEqual(shiftLoopWindow(state, "next", 28), { ...state, loopStart: 24, loopEnd: 28 })
  assert.deepEqual(shiftLoopWindow(state, "previous", 28), { ...state, loopStart: 16, loopEnd: 20 })
  assert.equal(shiftLoopWindow(state, "next", 27), null)
  assert.equal(shiftLoopWindow(state, "next", NaN), null)
  assert.equal(shiftLoopWindow(state, "next", 0), null)
})

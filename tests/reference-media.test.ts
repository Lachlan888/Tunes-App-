import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import {
  chooseReferenceMediaSource,
  getReferencePracticeHref,
  groupReferenceSectionsByMediaId,
  listReferenceMediaSources,
} from "../lib/reference-media-routing.ts"
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
} from "../components/library/youtube-loop-state.ts"

const canonical = {
  id: "canonical-42",
  url: "https://www.youtube.com/watch?v=canonical",
}
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
    shiftLoopWindow({ ...playingState, loopStart: 5, loopEnd: 15 }, "previous", 120),
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

test("recording switches use replaceable media URLs with tune identity", () => {
  assert.equal(
    getReferencePracticeHref(42, "media-8"),
    "/library/42/reference-media?media=media-8"
  )
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

  assert.match(launcher, /getReferencePracticeHref/)
  assert.doesNotMatch(launcher, /ReferenceMediaModal/)
  assert.match(workspace, /Set loop start/)
  assert.match(workspace, /Set loop end/)
  assert.match(workspace, /Play from start/)
  assert.match(
    workspace,
    /crossedLoopEnd\(previousTime, nextTime, loopEnd\)[\s\S]*player\.seekTo\(loopStart, true\)[\s\S]*player\.playVideo\(\)/
  )
  assert.match(workspace, /MobileViewSwitcher/)
  assert.equal((layout.match(/<PracticeMetronome/g) ?? []).length, 1)
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

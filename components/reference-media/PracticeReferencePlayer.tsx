"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import YouTubeLoopPlayer from "@/components/library/YouTubeLoopPlayer"
import { buildTuneMediaBundle, getLoopsForSource, getReferenceMediaSources, getReferencePracticeHref, resolveReferenceMediaSource, type TuneMediaBundle } from "@/lib/tune-media"
import type { Piece } from "@/lib/types"

export default function PracticeReferencePlayer({ piece, mediaBundle, returnTo, navigationDisabled = false, onControlsOpenChange }: {
  piece: Piece
  mediaBundle?: TuneMediaBundle
  returnTo: string
  navigationDisabled?: boolean
  onControlsOpenChange: (open: boolean) => void
}) {
  const bundle = useMemo(() => mediaBundle ?? buildTuneMediaBundle({ piece }), [mediaBundle, piece])
  const sources = useMemo(() => getReferenceMediaSources(bundle), [bundle])
  const [sourceId, setSourceId] = useState<string | null>(null)
  const source = resolveReferenceMediaSource(bundle, sourceId)
  const loops = useMemo(() => getLoopsForSource(bundle, source), [bundle, source])
  const selector = sources.length > 1 ? (
    <label className="block text-sm font-medium text-text-muted">Reference recording
      <select aria-label="Reference recording" value={source?.id ?? ""} onChange={event => setSourceId(event.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-hairline bg-surface-paper px-3 text-text-primary">
        {sources.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </label>
  ) : null

  return (
    <section data-reference-player className="practice-reference" aria-label="Reference recording">
      {source?.youtubeVideoId ? <YouTubeLoopPlayer key={source.youtubeVideoId} videoId={source.youtubeVideoId} title={`${piece.title} — ${source.label}`} recordingLabel={source.label} pieceId={piece.id} savedLoops={loops} mediaPanel={selector} presentation="session" onControlsOpenChange={onControlsOpenChange} /> : (
        <div className="practice-reference-empty">
          <p className="font-serif text-2xl font-semibold">{source ? "Your reference" : "Play it your way"}</p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">{source ? "This recording opens in a separate tab. Your practice stays here." : "There’s no reference recording for this tune yet. You can still practise and rate it below."}</p>
          {source ? <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center font-semibold text-state-practice underline underline-offset-4">Open reference ↗</a> : navigationDisabled ? <span aria-disabled="true" className="mt-4 inline-flex min-h-11 items-center text-sm text-text-muted">Add a reference</span> : <Link href={getReferencePracticeHref(piece.id, null, returnTo)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-state-practice underline underline-offset-4">Add a reference</Link>}
          {selector ? <div className="mt-5 w-full max-w-sm text-left">{selector}</div> : null}
        </div>
      )}
    </section>
  )
}

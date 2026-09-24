"use client"

import Link from "next/link"
import { useState } from "react"
import type { TuneMediaSource } from "@/lib/tune-media"
import { buttonStyles } from "@/components/ui/buttonStyles"

/** The parent unmounts this player on collapse or identity change, stopping playback. */
export default function InlineReferencePlayer({ source, fullHref }: { source: TuneMediaSource | null; fullHref: string }) {
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const videoId = source?.youtubeVideoId
  const playable = Boolean(videoId && /^[\w-]{11}$/.test(videoId))
  return <section aria-label="Reference player" data-reference-player className="space-y-3">
    <p className="text-sm font-semibold">{source?.label ?? "No reference saved yet"}</p>
    {playable ? <div className="relative aspect-video overflow-hidden rounded-control bg-surface-note">
      {playing ? <>
        {!loaded && <p role="status" className="absolute inset-0 grid place-items-center">Loading player…</p>}
        <iframe title={`${source!.label} — reference video`} className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen onLoad={() => setLoaded(true)} />
      </> : <div className="grid h-full place-items-center"><button type="button" className={buttonStyles.primary} onClick={() => setPlaying(true)}>▶ Play reference</button></div>}
    </div> : <p className="text-sm text-text-muted">{source ? "This source plays on its provider’s website." : "Add a recording in Reference Mode."}</p>}
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {source && <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline underline-offset-4">{playable ? "Video unavailable? Open source" : "Open source externally"}</a>}
      <Link href={fullHref} data-preserve-review="true" className={`${buttonStyles.secondary} !w-auto`}>Open full Reference Mode</Link>
    </div>
  </section>
}

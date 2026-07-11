"use client"

import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { TuneMediaBundle } from "@/lib/tune-media"
import { getLoopsForSource } from "@/lib/tune-media"

type TuneMediaLauncherProps = {
  pieceId: number
  title: string
  mediaBundle?: TuneMediaBundle | null
  redirectTo: string
  className?: string
  label?: string
  fallbackHref?: string
}

export default function TuneMediaLauncher({
  pieceId,
  title,
  mediaBundle,
  redirectTo,
  className,
  label = "Open Reference Media",
  fallbackHref = `/library/${pieceId}#reference-media`,
}: TuneMediaLauncherProps) {
  const bundle = mediaBundle ?? null
  const source = bundle?.effectiveReference ?? null

  if (!source || !bundle) {
    return (
      <a
        href={fallbackHref}
        className={className ?? buttonStyles.secondary}
      >
        Reference Media
      </a>
    )
  }

  if (source.isYouTube) {
    return (
      <ReferenceMediaEmbed
        referenceUrl={source.url}
        title={source.label || title}
        showHeading={false}
        triggerLabel={label}
        triggerClassName={className ?? buttonStyles.secondary}
        pieceId={pieceId}
        redirectTo={redirectTo}
        savedLoops={getLoopsForSource(bundle, source)}
      />
    )
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className={className ?? buttonStyles.secondary}
    >
      {label}
    </a>
  )
}

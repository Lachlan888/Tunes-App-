import Link from "next/link"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { TuneMediaBundle } from "@/lib/tune-media"
import {
  getReferencePracticeHref,
  resolveReferenceMediaSource,
} from "@/lib/tune-media"

type TuneMediaLauncherProps = {
  pieceId: number
  title: string
  mediaBundle?: TuneMediaBundle | null
  redirectTo: string
  className?: string
  label?: string
}

export default function TuneMediaLauncher({
  pieceId,
  title,
  mediaBundle,
  redirectTo,
  className,
  label = "Open Reference Media",
}: TuneMediaLauncherProps) {
  void title
  void redirectTo
  const source = mediaBundle
    ? resolveReferenceMediaSource(mediaBundle)
    : null

  return (
    <Link
      href={getReferencePracticeHref(pieceId, source?.id)}
      className={className ?? buttonStyles.secondary}
    >
      {label}
    </Link>
  )
}

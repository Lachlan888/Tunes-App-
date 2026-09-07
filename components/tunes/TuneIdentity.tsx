import Link from "next/link"
import type { ReactNode } from "react"

type TuneIdentityProps = {
  id: number
  title: string
  alternateTitles?: string | null
  tuneType?: string | null
  style?: string | null
  tuneKey?: string | null
  timeSignature?: string | null
  sourceSummary?: string | null
  personalState?: ReactNode
  className?: string
  headingClassName?: string
  linkClassName?: string
  headingLevel?: "h1" | "h2" | "h3"
  linkTitle?: boolean
}

export function getUsefulAlias(
  alternateTitles: string | null | undefined,
  title: string
) {
  return (
    alternateTitles
      ?.split(/[;,|]/)
      .map((value) => value.trim())
      .find(
        (value) =>
          Boolean(value) &&
          value.localeCompare(title, undefined, { sensitivity: "base" }) !== 0
      ) ?? null
  )
}

export default function TuneIdentity({
  id,
  title,
  alternateTitles,
  tuneType,
  style,
  tuneKey,
  timeSignature,
  sourceSummary,
  personalState,
  className,
  headingClassName = "break-words font-serif text-2xl font-bold leading-tight tracking-tight text-foreground",
  linkClassName = "decoration-primary decoration-2 underline-offset-4 hover:underline",
  headingLevel = "h3",
  linkTitle = true,
}: TuneIdentityProps) {
  const Heading = headingLevel
  const usefulAlias = getUsefulAlias(alternateTitles, title)
  const metadata = [
    tuneType,
    style,
    tuneKey ? `Key ${tuneKey}` : null,
    timeSignature,
  ].filter(Boolean)

  return (
    <div className={className}>
      <Heading className={headingClassName}>
        {linkTitle ? (
          <Link href={`/library/${id}`} className={linkClassName}>
            {title}
          </Link>
        ) : (
          title
        )}
      </Heading>

      {usefulAlias ? (
        <p className="mt-1 text-sm text-text-muted">Also {usefulAlias}</p>
      ) : null}

      {metadata.length > 0 ? (
        <p className="mt-1 text-sm leading-5 text-text-muted">
          {metadata.join(" · ")}
        </p>
      ) : null}

      {sourceSummary ? (
        <p className="mt-1 text-xs leading-5 text-text-muted">
          {sourceSummary}
        </p>
      ) : null}

      {personalState ? <div className="mt-2">{personalState}</div> : null}
    </div>
  )
}

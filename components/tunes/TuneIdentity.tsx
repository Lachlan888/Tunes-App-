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
  titleControl?: ReactNode
  className?: string
  headingClassName?: string
  linkClassName?: string
  headingLevel?: "h1" | "h2" | "h3"
  linkTitle?: boolean
  compactMobile?: boolean
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
  titleControl,
  className,
  headingClassName = "break-words font-sans text-2xl font-bold leading-tight tracking-tight text-foreground",
  linkClassName = "decoration-primary decoration-2 underline-offset-4 hover:underline",
  headingLevel = "h3",
  linkTitle = true,
  compactMobile = false,
}: TuneIdentityProps) {
  const Heading = headingLevel
  const usefulAlias = getUsefulAlias(alternateTitles, title)
  const metadata = [
    tuneType,
    style,
    tuneKey,
    timeSignature,
  ].filter(Boolean)

  return (
    <div className={className}>
      {compactMobile ? (
        <div className="min-w-0 md:hidden">
          <Heading className="min-w-0 break-words text-base font-semibold leading-tight text-text-primary">
            {titleControl ?? (linkTitle ? (
              <Link
                href={`/library/${id}`}
                className={`${linkClassName} break-words`}
              >
                {title}
              </Link>
            ) : (
              <span className="break-words">{title}</span>
            ))}
          </Heading>
          {metadata.length > 0 ? (
            <p className="mt-1 text-xs font-medium leading-5 text-text-muted">
              {metadata.join(" · ")}
            </p>
          ) : null}
          {usefulAlias ? <p className="mt-1 text-xs text-text-muted">Also {usefulAlias}</p> : null}
          {sourceSummary ? <p className="mt-1 text-xs text-text-muted">{sourceSummary}</p> : null}
          {personalState ? <div className="mt-1">{personalState}</div> : null}
        </div>
      ) : null}

      <div className={compactMobile ? "hidden md:block" : undefined}>
      <Heading className={headingClassName}>
        {titleControl ?? (linkTitle ? (
          <Link href={`/library/${id}`} className={linkClassName}>
            {title}
          </Link>
        ) : (
          title
        ))}
      </Heading>

      {usefulAlias ? (
        <p className="mt-1 text-sm text-text-muted">Also {usefulAlias}</p>
      ) : null}

      {metadata.length > 0 ? (
        <p className="mt-1 text-xs font-medium leading-5 tracking-[0.02em] text-text-muted">
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
    </div>
  )
}

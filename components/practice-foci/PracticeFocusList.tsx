import Link from "next/link"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeFocus } from "@/lib/loaders/practice-foci"

type PracticeFocusListProps = {
  activeFoci: PracticeFocus[]
  pausedFoci: PracticeFocus[]
  completedFoci: PracticeFocus[]
  archivedFoci: PracticeFocus[]
}

function getStatusLabel(status: PracticeFocus["status"]) {
  if (status === "active") return "Active"
  if (status === "paused") return "Paused"
  if (status === "completed") return "Completed"

  return "Archived"
}

function getStatusClasses(status: PracticeFocus["status"]) {
  if (status === "active") {
    return "border-success bg-success text-success-foreground"
  }

  if (status === "completed") {
    return "border-primary bg-primary text-primary-foreground"
  }

  return "border-border bg-muted text-muted-foreground"
}

function formatMeta(focus: PracticeFocus) {
  const tuneCount = focus.tunes.length
  const tuneLabel = tuneCount === 1 ? "1 tune" : `${tuneCount} tunes`

  if (focus.target_date) {
    return `${tuneLabel} · target ${focus.target_date}`
  }

  return tuneLabel
}

function MobileFocusRow({ focus }: { focus: PracticeFocus }) {
  return (
    <li className="border-b border-border py-4 last:border-b-0">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/review/foci/${focus.id}`}
            className="break-words font-medium text-foreground underline-offset-4 hover:underline"
          >
            {focus.title}
          </Link>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {formatMeta(focus)}
          </p>

          {focus.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {focus.description}
            </p>
          ) : null}
        </div>

        <span
          className={joinClasses(
            "shrink-0 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold",
            getStatusClasses(focus.status)
          )}
        >
          {getStatusLabel(focus.status)}
        </span>
      </div>

      <div className="mt-3">
        <Link
          href={`/review/foci/${focus.id}`}
          className={`${buttonStyles.secondaryStrong} !px-3 !py-1.5 text-xs`}
        >
          Open
        </Link>
      </div>
    </li>
  )
}

function DesktopFocusCard({ focus }: { focus: PracticeFocus }) {
  return (
    <article className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 break-words font-serif text-2xl font-bold leading-tight text-foreground">
              {focus.title}
            </h2>

            <span
              className={joinClasses(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                getStatusClasses(focus.status)
              )}
            >
              {getStatusLabel(focus.status)}
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {formatMeta(focus)}
          </p>

          {focus.description ? (
            <p className="mt-3 max-w-3xl break-words text-sm leading-6 text-muted-foreground">
              {focus.description}
            </p>
          ) : (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              No description yet.
            </p>
          )}
        </div>

        <Link
          href={`/review/foci/${focus.id}`}
          className={buttonStyles.secondaryStrong}
        >
          Open focus
        </Link>
      </div>
    </article>
  )
}

function FocusGroup({
  title,
  emptyMessage,
  foci,
  defaultOpen = true,
}: {
  title: string
  emptyMessage?: string
  foci: PracticeFocus[]
  defaultOpen?: boolean
}) {
  if (foci.length === 0 && !emptyMessage) {
    return null
  }

  const mobileContent =
    foci.length === 0 ? (
      <p className="py-4 text-sm leading-6 text-muted-foreground">
        {emptyMessage}
      </p>
    ) : (
      <ul>
        {foci.map((focus) => (
          <MobileFocusRow key={focus.id} focus={focus} />
        ))}
      </ul>
    )

  const desktopContent =
    foci.length === 0 ? (
      <div className="rounded-3xl border border-border bg-card p-6 text-sm leading-6 text-muted-foreground shadow-sm">
        {emptyMessage}
      </div>
    ) : (
      <div className="grid gap-4">
        {foci.map((focus) => (
          <DesktopFocusCard key={focus.id} focus={focus} />
        ))}
      </div>
    )

  if (!defaultOpen) {
    return (
      <details className="grid gap-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title} ({foci.length})
        </summary>

        <div className="mt-2 md:mt-4">
          <div className="md:hidden">{mobileContent}</div>
          <div className="hidden md:block">{desktopContent}</div>
        </div>
      </details>
    )
  }

  return (
    <section className="grid gap-2 md:gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>

      <div className="md:hidden">{mobileContent}</div>
      <div className="hidden md:block">{desktopContent}</div>
    </section>
  )
}

export default function PracticeFocusList({
  activeFoci,
  pausedFoci,
  completedFoci,
  archivedFoci,
}: PracticeFocusListProps) {
  return (
    <div className="grid min-w-0 gap-7 md:gap-6">
      <FocusGroup
        title="Active foci"
        emptyMessage="No active foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal."
        foci={activeFoci}
      />

      <FocusGroup title="Paused foci" foci={pausedFoci} defaultOpen={false} />

      <FocusGroup
        title="Completed foci"
        foci={completedFoci}
        defaultOpen={false}
      />

      <FocusGroup
        title="Archived foci"
        foci={archivedFoci}
        defaultOpen={false}
      />
    </div>
  )
}
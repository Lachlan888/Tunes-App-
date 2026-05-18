import Link from "next/link"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type {
  PracticeFocus,
  PracticeFocusStatus,
} from "@/lib/loaders/practice-foci"

type PracticeFocusListProps = {
  activeFoci: PracticeFocus[]
  pausedFoci: PracticeFocus[]
  completedFoci: PracticeFocus[]
  archivedFoci: PracticeFocus[]
}

type FocusGroupConfig = {
  status: PracticeFocusStatus
  title: string
  emptyMessage: string
  foci: PracticeFocus[]
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

function formatDateOnly(dateOnly: string | null) {
  if (!dateOnly) return null

  const [year, month, day] = dateOnly.split("-")

  if (!year || !month || !day) {
    return dateOnly
  }

  return `${day}/${month}/${year}`
}

function formatMeta(focus: PracticeFocus) {
  const tuneCount = focus.tunes.length
  const tuneLabel = tuneCount === 1 ? "1 tune" : `${tuneCount} tunes`
  const targetDate = formatDateOnly(focus.target_date)

  if (targetDate) {
    return `${tuneLabel} · target ${targetDate}`
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

function FocusRows({
  foci,
  emptyMessage,
}: {
  foci: PracticeFocus[]
  emptyMessage: string
}) {
  if (foci.length === 0) {
    return (
      <>
        <p className="py-4 text-sm leading-6 text-muted-foreground md:hidden">
          {emptyMessage}
        </p>

        <div className="hidden rounded-3xl border border-border bg-card p-6 text-sm leading-6 text-muted-foreground shadow-sm md:block">
          {emptyMessage}
        </div>
      </>
    )
  }

  return (
    <>
      <ul className="md:hidden">
        {foci.map((focus) => (
          <MobileFocusRow key={focus.id} focus={focus} />
        ))}
      </ul>

      <div className="hidden md:grid md:gap-4">
        {foci.map((focus) => (
          <DesktopFocusCard key={focus.id} focus={focus} />
        ))}
      </div>
    </>
  )
}

function FocusGroup({
  title,
  emptyMessage,
  foci,
  defaultOpen = true,
}: {
  title: string
  emptyMessage: string
  foci: PracticeFocus[]
  defaultOpen?: boolean
}) {
  if (!defaultOpen) {
    return (
      <details className="grid gap-4">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title} ({foci.length})
        </summary>

        <div className="mt-2 md:mt-4">
          <FocusRows foci={foci} emptyMessage={emptyMessage} />
        </div>
      </details>
    )
  }

  return (
    <section className="grid gap-2 md:gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>

        <p className="text-sm font-medium text-muted-foreground">
          {foci.length}
        </p>
      </div>

      <FocusRows foci={foci} emptyMessage={emptyMessage} />
    </section>
  )
}

export default function PracticeFocusList({
  activeFoci,
  pausedFoci,
  completedFoci,
  archivedFoci,
}: PracticeFocusListProps) {
  const groups: FocusGroupConfig[] = [
    {
      status: "active",
      title: "Active foci",
      emptyMessage:
        "No active foci yet. Create one when a few tunes are connected by the same musical problem or preparation goal.",
      foci: activeFoci,
    },
    {
      status: "paused",
      title: "Paused foci",
      emptyMessage: "No paused foci.",
      foci: pausedFoci,
    },
    {
      status: "completed",
      title: "Completed foci",
      emptyMessage: "No completed foci.",
      foci: completedFoci,
    },
    {
      status: "archived",
      title: "Archived foci",
      emptyMessage: "No archived foci.",
      foci: archivedFoci,
    },
  ]

  return (
    <div className="grid min-w-0 gap-7 md:gap-6">
      {groups.map((group) => (
        <FocusGroup
          key={group.status}
          title={group.title}
          emptyMessage={group.emptyMessage}
          foci={group.foci}
          defaultOpen={group.status === "active"}
        />
      ))}
    </div>
  )
}
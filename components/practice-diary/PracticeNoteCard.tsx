import type {
  PracticeNote,
  PracticeNoteCategory,
} from "@/lib/loaders/practice-diary"

type PracticeNoteCardProps = {
  note: PracticeNote
  categories: PracticeNoteCategory[]
  redirectTo: string
}

function formatNoteTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function getCategoryName({
  note,
  categories,
}: {
  note: PracticeNote
  categories: PracticeNoteCategory[]
}) {
  if (note.category?.name) return note.category.name

  if (!note.category_id) return null

  return (
    categories.find((category) => category.id === note.category_id)?.name ?? null
  )
}

export default function PracticeNoteCard({
  note,
  categories,
}: PracticeNoteCardProps) {
  const categoryName = getCategoryName({ note, categories })

  return (
    <article className="rounded-2xl border border-border bg-background/70 p-4 text-sm shadow-sm md:bg-card">
      <div className="flex flex-wrap items-center gap-2">
        {categoryName ? (
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {categoryName}
          </span>
        ) : null}

        {note.focus?.title ? (
          <span className="rounded-full border border-accent bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
            {note.focus.title}
          </span>
        ) : null}

        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {formatNoteTime(note.created_at)}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap leading-6 text-foreground">
        {note.body}
      </p>
    </article>
  )
}
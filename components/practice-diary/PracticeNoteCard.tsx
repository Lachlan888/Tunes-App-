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
    <article className="border-l-2 border-state-practice pl-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
        {categoryName ? (
          <span className="font-semibold text-foreground">
            {categoryName}
          </span>
        ) : null}

        {note.focus?.title ? (
          <><span aria-hidden="true">·</span><span>{note.focus.title}</span></>
        ) : null}

        <span aria-hidden="true">·</span>
        <span>
          {formatNoteTime(note.created_at)}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap leading-6 text-foreground">
        {note.body}
      </p>
    </article>
  )
}

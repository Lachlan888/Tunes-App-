import Link from "next/link"
import { notFound } from "next/navigation"
import PracticeDiaryNav from "@/components/practice-diary/PracticeDiaryNav"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { requireUserContext } from "@/lib/auth/session"

type PracticeCategoryDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type CategoryRow = {
  id: number
  user_id: string
  name: string
  prompt: string | null
  applies_to_tune_notes: boolean
  applies_to_daily_reflection: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string | null
}

type CategoryNoteRow = {
  id: number
  body: string
  created_at: string
  piece_id: number | null
  practice_day_id: number
  pieces:
    | {
        id: number
        title: string
      }
    | {
        id: number
        title: string
      }[]
    | null
  practice_days:
    | {
        id: number
        practice_date: string
      }
    | {
        id: number
        practice_date: string
      }[]
    | null
}

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function formatDisplayDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`))
}

export default async function PracticeCategoryDetailPage({
  params,
}: PracticeCategoryDetailPageProps) {
  const resolvedParams = await params
  const categoryId = Number(resolvedParams.id)

  if (!Number.isFinite(categoryId)) {
    notFound()
  }

  const { supabase, user } = await requireUserContext()

  const { data: categoryData, error: categoryError } = await supabase
    .from("practice_note_categories")
    .select(
      `
        id,
        user_id,
        name,
        prompt,
        applies_to_tune_notes,
        applies_to_daily_reflection,
        sort_order,
        is_active,
        created_at,
        updated_at
      `
    )
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (categoryError) {
    throw new Error(categoryError.message)
  }

  if (!categoryData) {
    notFound()
  }

  const category = categoryData as CategoryRow

  const { data: noteData, error: noteError } = await supabase
    .from("practice_notes")
    .select(
      `
        id,
        body,
        created_at,
        piece_id,
        practice_day_id,
        pieces (
          id,
          title
        ),
        practice_days (
          id,
          practice_date
        )
      `
    )
    .eq("user_id", user.id)
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })

  if (noteError) {
    throw new Error(noteError.message)
  }

  const notes = (noteData ?? []) as unknown as CategoryNoteRow[]

  return (
    <main className="mx-auto max-w-[1100px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="mb-5 md:hidden">
        <Link href="/review/diary" className={buttonStyles.text}>
          Back to diary
        </Link>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Practice category
        </p>

        <h1 className="mt-2 break-words font-serif text-3xl font-bold leading-tight tracking-tight">
          {category.name}
        </h1>

        {category.prompt ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {category.prompt}
          </p>
        ) : null}

        <PracticeDiaryNav active="diary" />
      </section>

      <section className="mb-6 hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Link href="/review/diary" className={buttonStyles.text}>
              Back to diary
            </Link>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Practice category
            </p>

            <h1 className="mt-2 break-words font-serif text-5xl font-bold leading-tight tracking-tight">
              {category.name}
            </h1>

            {category.prompt ? (
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                {category.prompt}
              </p>
            ) : null}
          </div>
        </div>

        <PracticeDiaryNav active="diary" />
      </section>

      <section className="space-y-4 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Notes in this category
            </h2>

            <p className="mt-2 text-sm font-medium text-muted-foreground md:hidden">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>

            <p className="mt-3 hidden text-sm leading-6 text-muted-foreground md:block">
              Practice notes you have tagged with this category.
            </p>
          </div>

          <p className="hidden text-sm font-medium text-muted-foreground md:block">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>

        {notes.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            No notes have been tagged with this category yet.
          </p>
        ) : (
          <div className="divide-y divide-border/70 md:mt-5 md:space-y-3 md:divide-y-0">
            {notes.map((note) => {
              const piece = getSingleJoinedRow(note.pieces)
              const practiceDay = getSingleJoinedRow(note.practice_days)

              return (
                <article
                  key={note.id}
                  className="space-y-4 py-5 first:pt-1 last:pb-0 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4 md:shadow-sm"
                >
                  <div className="grid gap-2">
                    {piece ? (
                      <Link
                        href={`/library/${piece.id}`}
                        className="inline-flex max-w-full font-serif text-2xl font-bold leading-tight text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:text-2xl"
                      >
                        <span className="break-words">{piece.title}</span>
                      </Link>
                    ) : (
                      <h3 className="font-serif text-2xl font-bold leading-tight">
                        Untitled note
                      </h3>
                    )}

                    {practiceDay ? (
                      <Link
                        href={`/review/diary?view=day&date=${practiceDay.practice_date}`}
                        className="w-fit text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {formatDisplayDate(practiceDay.practice_date)}
                      </Link>
                    ) : null}
                  </div>

                  <p className="whitespace-pre-wrap text-lg leading-8 text-foreground md:text-base md:leading-7">
                    {note.body}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
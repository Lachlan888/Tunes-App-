import Link from "next/link"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type {
  TunePracticeNote,
  UserPieceMetadata,
} from "@/lib/loaders/tune-detail"

type MobileTuneNotesSectionProps = {
  pieceId: number
  redirectTo: string
  userPieceMetadata: UserPieceMetadata | null
  practiceNotes: TunePracticeNote[]
  showMyNotes: boolean
  showPracticeHistory: boolean
  upsertUserPieceNotes: (formData: FormData) => Promise<void>
}

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function MobileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="min-w-0 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  )
}

export default function MobileTuneNotesSection({
  pieceId,
  redirectTo,
  userPieceMetadata,
  practiceNotes,
  showMyNotes,
  showPracticeHistory,
  upsertUserPieceNotes,
}: MobileTuneNotesSectionProps) {
  if (!showMyNotes && !showPracticeHistory) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Notes sections are hidden in Display options.
      </p>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {showMyNotes ? (
        <MobileSection title="My notes">
          <form action={upsertUserPieceNotes} className="space-y-3">
            <input type="hidden" name="piece_id" value={pieceId} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <textarea
              name="notes"
              defaultValue={userPieceMetadata?.notes || ""}
              rows={8}
              placeholder="Add your private notes for this tune"
              className={inputClassName}
            />

            <SubmitButton
              label="Save notes"
              pendingLabel="Saving..."
              className={joinClasses(buttonStyles.primary, "w-full")}
            />
          </form>
        </MobileSection>
      ) : null}

      {showPracticeHistory ? (
        <MobileSection title="Practice history">
          {practiceNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No diary notes for this tune yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {practiceNotes.map((note) => (
                <li key={note.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/review/diary?date=${note.practice_date}`}
                      className="text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                    >
                      {formatDate(note.created_at)}
                    </Link>

                    {note.category_name ? (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {note.category_name}
                      </span>
                    ) : null}

                    {note.outcome ? (
                      <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                        {note.outcome === "failed"
                          ? "Rough"
                          : note.outcome === "shaky"
                            ? "Shaky"
                            : note.outcome === "solid"
                              ? "Solid"
                              : note.outcome}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {note.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </MobileSection>
      ) : null}
    </div>
  )
}

import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { PieceSheetMusicLink } from "@/lib/loaders/tune-detail"

type PieceSheetMusicSectionProps = {
  pieceId: number
  redirectTo: string
  sheetMusicLinks: PieceSheetMusicLink[]
  addPieceSheetMusicLink: (formData: FormData) => Promise<void>
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function PieceSheetMusicSection({
  pieceId,
  redirectTo,
  sheetMusicLinks,
  addPieceSheetMusicLink,
}: PieceSheetMusicSectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Sheet music / tab
      </h2>

      <form action={addPieceSheetMusicLink} className="mt-5 space-y-3">
        <input type="hidden" name="piece_id" value={pieceId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <input
          name="label"
          placeholder="Label, eg Mandolin tab"
          className={inputClassName}
          required
        />

        <input
          name="url"
          type="url"
          placeholder="https://..."
          className={inputClassName}
          required
        />

        <SubmitButton
          label="Add sheet music link"
          pendingLabel="Adding..."
          className={buttonStyles.primary}
        />
      </form>

      {sheetMusicLinks.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {sheetMusicLinks.map((link) => (
            <li
              key={link.id}
              className="rounded-2xl border border-border bg-background/70 p-4"
            >
              <p className="text-sm font-medium text-foreground">
                {link.label}
              </p>

              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {link.url}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          No sheet music links yet.
        </p>
      )}
    </section>
  )
}
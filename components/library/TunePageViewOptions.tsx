import SubmitButton from "@/components/SubmitButton"
import { updateTunePagePreferences } from "@/lib/actions/tune-page-preferences"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { TunePagePreferences } from "@/lib/loaders/tune-detail"

type TunePageViewOptionsProps = {
  preferences: TunePagePreferences
  redirectTo: string
}

const OPTIONS: Array<{
  field: keyof TunePagePreferences
  label: string
  description: string
}> = [
  {
    field: "show_tune_state",
    label: "Tune state",
    description: "Practice, known, list count, and main tune actions.",
  },
  {
    field: "show_canonical_details",
    label: "Canonical details",
    description: "Shared tune metadata such as key, style, time signature, and reference URL.",
  },
  {
    field: "show_my_notes",
    label: "My notes",
    description: "Your stable private notes for this tune.",
  },
  {
    field: "show_practice_history",
    label: "Practice history",
    description: "Dated notes from your Practice Diary for this tune.",
  },
  {
    field: "show_media_links",
    label: "Media links",
    description: "Reference recordings and other tune-linked media.",
  },
  {
    field: "show_sheet_music",
    label: "Sheet music / tab",
    description: "Sheet music, tab, and chart links.",
  },
  {
    field: "show_lore",
    label: "Lore",
    description: "Community tune lore, source notes, alternate titles, and history.",
  },
  {
    field: "show_comments",
    label: "Comments",
    description: "Community discussion for this tune.",
  },
]

export default function TunePageViewOptions({
  preferences,
  redirectTo,
}: TunePageViewOptionsProps) {
  return (
    <details className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">
        Customise Tune page view
      </summary>

      <form action={updateTunePagePreferences} className="mt-5 space-y-5">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="grid gap-3 md:grid-cols-2">
          {OPTIONS.map((option) => (
            <label
              key={option.field}
              className="flex gap-3 rounded-2xl border border-border bg-muted/60 p-4"
            >
              <input
                type="checkbox"
                name={option.field}
                value="true"
                defaultChecked={preferences[option.field]}
                className="mt-1 h-4 w-4 rounded border-border accent-primary"
              />

              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {option.label}
                </span>

                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton
            label="Save view preferences"
            pendingLabel="Saving..."
            className={buttonStyles.primary}
          />

          <p className="text-sm text-muted-foreground">
            These settings apply to every tune page.
          </p>
        </div>
      </form>
    </details>
  )
}
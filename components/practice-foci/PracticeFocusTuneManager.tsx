import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import {
  addTuneToPracticeFocus,
  removeTuneFromPracticeFocus,
} from "@/lib/actions/practice-foci"
import type {
  ActivePracticeTuneOption,
  PracticeFocus,
} from "@/lib/loaders/practice-foci"

type PracticeFocusTuneManagerProps = {
  focus: PracticeFocus
  activePracticeTunes: ActivePracticeTuneOption[]
}

function getTuneMeta(tune: ActivePracticeTuneOption) {
  return [
    tune.key ? `Key: ${tune.key}` : "Key unknown",
    tune.style ? `Style: ${tune.style}` : "Style unknown",
    tune.time_signature ? `Time: ${tune.time_signature}` : "Time unknown",
    `Stage ${tune.stage}`,
  ].join(" | ")
}

export default function PracticeFocusTuneManager({
  focus,
  activePracticeTunes,
}: PracticeFocusTuneManagerProps) {
  const focusPieceIds = new Set(focus.tunes.map((tune) => tune.piece_id))
  const availableTunes = activePracticeTunes.filter(
    (tune) => !focusPieceIds.has(tune.piece_id)
  )

  return (
    <div className="mt-5 grid gap-4">
      {focus.status === "active" ? (
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Add active-practice tune
          </p>

          {availableTunes.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No more active-practice tunes are available for this focus.
            </p>
          ) : (
            <form action={addTuneToPracticeFocus} className="mt-3">
              <input type="hidden" name="focus_id" value={focus.id} />
              <input type="hidden" name="redirect_to" value="/review/foci" />

              <label className="grid gap-2 text-sm font-medium text-foreground">
                Tune
                <select
                  name="piece_id"
                  required
                  className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose a tune
                  </option>

                  {availableTunes.map((tune) => (
                    <option key={tune.piece_id} value={tune.piece_id}>
                      {tune.title} — Stage {tune.stage}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-4">
                <SubmitButton
                  label="Add tune"
                  pendingLabel="Adding..."
                  className={buttonStyles.secondaryStrong}
                />
              </div>
            </form>
          )}
        </div>
      ) : null}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Tunes in this focus ({focus.tunes.length})
        </p>

        {focus.tunes.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No tunes added yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {focus.tunes.map((focusTune) => (
              <li
                key={focusTune.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-4 shadow-sm md:flex-row md:items-start md:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {focusTune.piece?.title ?? "Untitled tune"}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {focusTune.piece
                      ? [
                          focusTune.piece.key
                            ? `Key: ${focusTune.piece.key}`
                            : "Key unknown",
                          focusTune.piece.style
                            ? `Style: ${focusTune.piece.style}`
                            : "Style unknown",
                          focusTune.piece.time_signature
                            ? `Time: ${focusTune.piece.time_signature}`
                            : "Time unknown",
                        ].join(" | ")
                      : "Tune details unavailable"}
                  </p>
                </div>

                {focus.status === "active" ? (
                  <form action={removeTuneFromPracticeFocus}>
                    <input
                      type="hidden"
                      name="focus_tune_id"
                      value={focusTune.id}
                    />
                    <input
                      type="hidden"
                      name="redirect_to"
                      value="/review/foci"
                    />

                    <SubmitButton
                      label="Remove"
                      pendingLabel="Removing..."
                      className={buttonStyles.secondary}
                    />
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {availableTunes.length > 0 && focus.status === "active" ? (
        <div className="rounded-2xl border border-border bg-muted/60 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Available active-practice tunes
          </p>

          <ul className="mt-3 space-y-2">
            {availableTunes.slice(0, 5).map((tune) => (
              <li key={tune.piece_id} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {tune.title}
                </span>{" "}
                — {getTuneMeta(tune)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
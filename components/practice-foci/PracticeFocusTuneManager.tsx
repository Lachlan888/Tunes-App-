"use client"

import { useMemo, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import {
  addTuneToPracticeFocus,
  removeTuneFromPracticeFocus,
} from "@/lib/actions/practice-foci"
import type {
  FocusTuneOption,
  PracticeFocus,
  PracticeFocusTune,
} from "@/lib/loaders/practice-foci"

type PracticeFocusTuneManagerProps = {
  focus: PracticeFocus
  focusTuneOptions: FocusTuneOption[]
  redirectTo: string
}

function getPieceMeta(piece: {
  key?: string | null
  style?: string | null
  time_signature?: string | null
}) {
  return [
    piece.key ? `Key: ${piece.key}` : "Key unknown",
    piece.style ? `Style: ${piece.style}` : "Style unknown",
    piece.time_signature ? `Time: ${piece.time_signature}` : "Time unknown",
  ].join(" · ")
}

function normaliseSearch(value: string) {
  return value.toLowerCase().trim()
}

function getTuneSourceLabel(tune: FocusTuneOption) {
  if (tune.source === "known") return "Known"

  return tune.stage ? `Stage ${tune.stage}` : "In practice"
}

function AddTuneDesktopForm({
  focus,
  availableTunes,
  redirectTo,
}: {
  focus: PracticeFocus
  availableTunes: FocusTuneOption[]
  redirectTo: string
}) {
  return (
    <details className="hidden md:block md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
        Add repertoire tune
      </summary>

      {availableTunes.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No more known or active-practice tunes are available for this focus.
        </p>
      ) : (
        <form action={addTuneToPracticeFocus} className="mt-4">
          <input type="hidden" name="focus_id" value={focus.id} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <label className="grid gap-2 text-sm font-medium text-foreground">
            Tune
            <select
              name="piece_id"
              required
              className="min-w-0 max-w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
              defaultValue=""
            >
              <option value="" disabled>
                Choose a tune
              </option>

              {availableTunes.map((tune) => (
                <option key={tune.piece_id} value={tune.piece_id}>
                  {tune.title} — {getTuneSourceLabel(tune)}
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
    </details>
  )
}

function MobileTunePickerSheet({
  focus,
  availableTunes,
  redirectTo,
  isOpen,
  onClose,
}: {
  focus: PracticeFocus
  availableTunes: FocusTuneOption[]
  redirectTo: string
  isOpen: boolean
  onClose: () => void
}) {
  const [search, setSearch] = useState("")

  const filteredTunes = useMemo(() => {
    const normalisedSearch = normaliseSearch(search)

    if (normalisedSearch === "") {
      return availableTunes
    }

    return availableTunes.filter((tune) =>
      normaliseSearch(
        [
          tune.title,
          tune.key ?? "",
          tune.style ?? "",
          tune.time_signature ?? "",
          tune.source,
          tune.stage ? `stage ${tune.stage}` : "",
          getTuneSourceLabel(tune),
        ].join(" ")
      ).includes(normalisedSearch)
    )
  }, [availableTunes, search])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-foreground/40 px-0 sm:items-center sm:px-4"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="max-h-[88vh] w-full overflow-hidden rounded-t-3xl border border-border bg-background shadow-xl sm:mx-auto sm:max-w-lg sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-focus-tune-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Add tune
              </p>

              <h3
                id="add-focus-tune-title"
                className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground"
              >
                Known and practice tunes
              </h3>
            </div>

            <button
              type="button"
              className={buttonStyles.text}
              onClick={onClose}
            >
              Close
            </button>
          </div>

          <label className="mt-4 block">
            <span className="sr-only">Search known and practice tunes</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tunes..."
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </label>
        </div>

        <div className="max-h-[58vh] overflow-y-auto px-4">
          {availableTunes.length === 0 ? (
            <p className="py-5 text-sm leading-6 text-muted-foreground">
              No more known or active-practice tunes are available for this
              focus.
            </p>
          ) : filteredTunes.length === 0 ? (
            <p className="py-5 text-sm leading-6 text-muted-foreground">
              No matching known or active-practice tunes.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filteredTunes.map((tune) => (
                <li
                  key={tune.piece_id}
                  className="flex min-w-0 items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <p className="break-words font-medium text-foreground">
                      {tune.title}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {getTuneSourceLabel(tune)}
                      {tune.key ? ` · Key: ${tune.key}` : ""}
                      {tune.style ? ` · ${tune.style}` : ""}
                    </p>
                  </div>

                  <form action={addTuneToPracticeFocus} className="shrink-0">
                    <input type="hidden" name="focus_id" value={focus.id} />
                    <input
                      type="hidden"
                      name="piece_id"
                      value={tune.piece_id}
                    />
                    <input
                      type="hidden"
                      name="redirect_to"
                      value={redirectTo}
                    />

                    <SubmitButton
                      label="Add"
                      pendingLabel="Adding..."
                      className={`${buttonStyles.secondaryStrong} !px-3 !py-1.5 text-xs`}
                    />
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function AddTuneMobilePicker({
  focus,
  availableTunes,
  redirectTo,
}: {
  focus: PracticeFocus
  availableTunes: FocusTuneOption[]
  redirectTo: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <div className="grid gap-3">
        <button
          type="button"
          className={`${buttonStyles.secondaryStrong} w-full`}
          onClick={() => setIsOpen(true)}
        >
          Add repertoire tune
        </button>

        {availableTunes.length === 0 ? (
          <p className="text-sm leading-6 text-muted-foreground">
            No more known or active-practice tunes are available for this focus.
          </p>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Choose from {availableTunes.length} known or active-practice{" "}
            {availableTunes.length === 1 ? "tune" : "tunes"}.
          </p>
        )}
      </div>

      <MobileTunePickerSheet
        focus={focus}
        availableTunes={availableTunes}
        redirectTo={redirectTo}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  )
}

function RemoveTuneFromFocusModal({
  focusTune,
  redirectTo,
  onClose,
}: {
  focusTune: PracticeFocusTune
  redirectTo: string
  onClose: () => void
}) {
  const tuneTitle = focusTune.piece?.title ?? "this tune"

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-foreground/40 px-0 sm:items-center sm:px-4"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="w-full rounded-t-3xl border border-border bg-background p-4 shadow-xl sm:mx-auto sm:max-w-md sm:rounded-3xl sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-focus-tune-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
              Remove tune
            </p>

            <h3
              id="remove-focus-tune-title"
              className="mt-1 font-serif text-2xl font-bold leading-tight text-foreground"
            >
              Remove from this focus?
            </h3>
          </div>

          <button
            type="button"
            className={buttonStyles.text}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This will remove{" "}
          <span className="font-medium text-foreground">{tuneTitle}</span> from
          this practice focus only. It will not remove the tune from practice,
          lists, known tunes, or the library.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`${buttonStyles.secondary} w-full`}
            onClick={onClose}
          >
            Cancel
          </button>

          <form action={removeTuneFromPracticeFocus} className="w-full">
            <input
              type="hidden"
              name="focus_tune_id"
              value={focusTune.id}
            />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <SubmitButton
              label="Remove"
              pendingLabel="Removing..."
              className={`${buttonStyles.destructiveSecondary} w-full`}
            />
          </form>
        </div>
      </section>
    </div>
  )
}

function FocusTuneRemoveButton({
  focusTune,
  redirectTo,
}: {
  focusTune: PracticeFocusTune
  redirectTo: string
}) {
  const [isConfirming, setIsConfirming] = useState(false)
  const tuneTitle = focusTune.piece?.title ?? "this tune"

  return (
    <>
      <button
        type="button"
        className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background/70 text-lg font-semibold leading-none text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-destructive hover:bg-destructive/10 hover:text-destructive focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        onClick={() => setIsConfirming(true)}
        aria-label={`Remove ${tuneTitle} from this focus`}
        title={`Remove ${tuneTitle} from this focus`}
      >
        ×
      </button>

      {isConfirming ? (
        <RemoveTuneFromFocusModal
          focusTune={focusTune}
          redirectTo={redirectTo}
          onClose={() => setIsConfirming(false)}
        />
      ) : null}
    </>
  )
}

export default function PracticeFocusTuneManager({
  focus,
  focusTuneOptions,
  redirectTo,
}: PracticeFocusTuneManagerProps) {
  const focusPieceIds = new Set(focus.tunes.map((tune) => tune.piece_id))
  const availableTunes = focusTuneOptions.filter(
    (tune) => !focusPieceIds.has(tune.piece_id)
  )

  return (
    <div className="grid min-w-0 gap-5">
      {focus.status === "active" ? (
        <>
          <AddTuneMobilePicker
            focus={focus}
            availableTunes={availableTunes}
            redirectTo={redirectTo}
          />

          <AddTuneDesktopForm
            focus={focus}
            availableTunes={availableTunes}
            redirectTo={redirectTo}
          />
        </>
      ) : null}

      {focus.tunes.length === 0 ? (
        <p className="border-t border-border pt-4 text-sm text-muted-foreground md:rounded-2xl md:border md:bg-background/70 md:p-4">
          No tunes added yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {focus.tunes.map((focusTune) => (
            <li
              key={focusTune.id}
              className="flex min-w-0 items-start justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="break-words font-medium text-foreground">
                  {focusTune.piece?.title ?? "Untitled tune"}
                </p>

                <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">
                  {focusTune.piece
                    ? getPieceMeta(focusTune.piece)
                    : "Tune details unavailable"}
                </p>
              </div>

              {focus.status === "active" ? (
                <FocusTuneRemoveButton
                  focusTune={focusTune}
                  redirectTo={redirectTo}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import type { SetlistItemWithCoverage } from "@/lib/types"

type EditSetlistItemModalProps = {
  item: SetlistItemWithCoverage
  redirectTo: string
  updateSetlistItem: (formData: FormData) => Promise<void>
}

const inputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function EditSetlistItemModal({
  item,
  redirectTo,
  updateSetlistItem,
}: EditSetlistItemModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const title = item.piece?.title ?? "Tune"

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Edit
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Setlist tune
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  These details belong to this setlist only. They do not edit
                  the shared tune record.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Close
              </button>
            </div>

            <form action={updateSetlistItem} className="mt-6 space-y-4">
              <input type="hidden" name="setlist_id" value={item.setlist_id} />
              <input
                type="hidden"
                name="setlist_item_id"
                value={item.id}
              />
              <input type="hidden" name="redirect_to" value={redirectTo} />

              <div>
                <label className="text-sm font-medium text-foreground">
                  Performance key
                </label>
                <input
                  name="performance_key"
                  defaultValue={item.performance_key ?? ""}
                  placeholder={
                    item.piece?.key ? `Default: ${item.piece.key}` : "Optional"
                  }
                  className={`${inputClass} mt-2`}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  defaultValue={item.notes ?? ""}
                  placeholder="Intro, ending, who starts, medley transition..."
                  className={`${inputClass} mt-2`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">
                    Chart or music URL
                  </label>
                  <input
                    name="chart_url"
                    defaultValue={item.chart_url ?? ""}
                    placeholder="https://..."
                    className={`${inputClass} mt-2`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">
                    Type
                  </label>
                  <select
                    name="chart_type"
                    defaultValue={item.chart_type ?? ""}
                    className={`${inputClass} mt-2`}
                  >
                    <option value="">Choose</option>
                    <option value="PDF">PDF</option>
                    <option value="Image">Image</option>
                    <option value="Audio">Audio</option>
                    <option value="Video">Video</option>
                    <option value="ABC">ABC</option>
                    <option value="MuseScore">MuseScore</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Chart label
                </label>
                <input
                  name="chart_label"
                  defaultValue={item.chart_label ?? ""}
                  placeholder="Duo chart, fiddle handout, rehearsal recording..."
                  className={`${inputClass} mt-2`}
                />
              </div>

              <SubmitButton
                label="Save tune details"
                pendingLabel="Saving..."
                className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

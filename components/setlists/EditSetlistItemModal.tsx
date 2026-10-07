"use client"

import { useState } from "react"
import KeyPickerField from "@/components/music/KeyPickerField"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import type { SetlistItemWithCoverage } from "@/lib/types"

type EditSetlistItemModalProps = {
  item: SetlistItemWithCoverage
  redirectTo: string
  updateSetlistItem: (formData: FormData) => Promise<void>
  controlledOpen?: boolean
  onControlledClose?: () => void
}

const inputClass =
  "w-full rounded-control border border-hairline bg-surface-paper px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function EditSetlistItemModal({
  item,
  redirectTo,
  updateSetlistItem,
  controlledOpen,
  onControlledClose,
}: EditSetlistItemModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen

  const title = item.piece?.title ?? "Tune"

  return (
    <>
      {controlledOpen === undefined ? <button
        type="button"
        onClick={() => setInternalOpen(true)}
        className="min-h-11 inline-flex items-center justify-center rounded-control border border-hairline px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-surface-note hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
      >
        Edit
      </button> : null}

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => controlledOpen === undefined ? setInternalOpen(false) : onControlledClose?.()}
        title={title}
        description="These details belong to this setlist only. They do not edit the shared tune record."
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-2xl"
      >
            <form action={updateSetlistItem} className="space-y-4">
              <input type="hidden" name="setlist_id" value={item.setlist_id} />
              <input
                type="hidden"
                name="setlist_item_id"
                value={item.id}
              />
              <input type="hidden" name="redirect_to" value={redirectTo} />
              <input type="hidden" name="expected_version" value={item.updated_at ?? item.created_at} />

              <KeyPickerField
                name="performance_key"
                label="Performance key"
                defaultValue={item.performance_key ?? ""}
                placeholder="Select key"
                helperText={
                  item.piece?.key
                    ? `Leave blank to use the tune key: ${item.piece.key}.`
                    : "Optional. This belongs only to this setlist."
                }
              />

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
                className="w-full min-h-11 inline-flex items-center justify-center rounded-control border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              />
            </form>
      </ResponsiveModal>
    </>
  )
}

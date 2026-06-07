"use client"

import { useMemo, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ReferenceMediaEmbed from "@/components/library/ReferenceMediaEmbed"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { PreferredReferenceMetadata } from "@/lib/effective-reference"
import type { UserPieceMediaLoop } from "@/lib/types"
import { getYouTubeVideoId } from "@/lib/youtube"

export type ReferenceMediaOption = {
  id: string
  url: string
  label: string
  sourceLabel: string
}

type PreferredReferenceControlProps = {
  pieceId: number
  title: string
  defaultReferenceUrl?: string | null
  mediaLinks?: Array<{
    id: number
    url: string
    label: string | null
  }>
  metadata?: PreferredReferenceMetadata
  redirectTo: string
  savedLoops?: UserPieceMediaLoop[]
  upsertPreferredReferenceUrl?: (formData: FormData) => Promise<void>
  removePreferredReferenceUrl?: (formData: FormData) => Promise<void>
  addPieceMediaLink?: (formData: FormData) => Promise<void>
  className?: string
  triggerClassName?: string
  compact?: boolean
  allowAddMediaLink?: boolean
  openLabel?: string
  showPickerTrigger?: boolean
  pickerTriggerLabel?: string
}

const inputClassName =
  "w-full min-w-0 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

function getOptionLabel(option: ReferenceMediaOption) {
  return option.label || option.sourceLabel
}

function buildReferenceOptions({
  title,
  defaultReferenceUrl,
  mediaLinks = [],
  metadata,
}: {
  title: string
  defaultReferenceUrl?: string | null
  mediaLinks?: PreferredReferenceControlProps["mediaLinks"]
  metadata?: PreferredReferenceMetadata
}) {
  const options: ReferenceMediaOption[] = []
  const seenUrls = new Set<string>()
  const preferredUrl = metadata?.preferred_reference_url || null

  function addOption(option: ReferenceMediaOption) {
    if (!option.url || seenUrls.has(option.url)) return

    options.push(option)
    seenUrls.add(option.url)
  }

  if (preferredUrl) {
    addOption({
      id: "preferred",
      url: preferredUrl,
      label: metadata?.preferred_reference_label || title,
      sourceLabel: "Preferred",
    })
  }

  if (defaultReferenceUrl) {
    addOption({
      id: "default",
      url: defaultReferenceUrl,
      label: title,
      sourceLabel: "Default tune reference",
    })
  }

  for (const link of mediaLinks) {
    addOption({
      id: `media-${link.id}`,
      url: link.url,
      label: link.label || "Untitled media link",
      sourceLabel: "Other media",
    })
  }

  return options
}

function ReferenceOpenButton({
  option,
  title,
  pieceId,
  redirectTo,
  savedLoops,
  className,
  openLabel,
}: {
  option: ReferenceMediaOption
  title: string
  pieceId: number
  redirectTo: string
  savedLoops: UserPieceMediaLoop[]
  className?: string
  openLabel: string
}) {
  const videoId = getYouTubeVideoId(option.url)
  const label = getOptionLabel(option)

  if (videoId) {
    return (
      <ReferenceMediaEmbed
        referenceUrl={option.url}
        title={label || title}
        showHeading={false}
        triggerLabel={openLabel}
        triggerClassName={className ?? buttonStyles.secondary}
        pieceId={pieceId}
        redirectTo={redirectTo}
        savedLoops={savedLoops}
      />
    )
  }

  return (
    <a
      href={option.url}
      target="_blank"
      rel="noreferrer"
      className={className ?? buttonStyles.secondary}
    >
      {openLabel}
    </a>
  )
}

export default function PreferredReferenceControl({
  pieceId,
  title,
  defaultReferenceUrl,
  mediaLinks = [],
  metadata,
  redirectTo,
  savedLoops = [],
  upsertPreferredReferenceUrl,
  removePreferredReferenceUrl,
  addPieceMediaLink,
  className,
  triggerClassName,
  compact = false,
  allowAddMediaLink = false,
  openLabel = "Open",
  showPickerTrigger = true,
  pickerTriggerLabel = "Change",
}: PreferredReferenceControlProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const preferredUrl = metadata?.preferred_reference_url || null
  const options = useMemo(
    () =>
      buildReferenceOptions({
        title,
        defaultReferenceUrl,
        mediaLinks,
        metadata,
      }),
    [defaultReferenceUrl, mediaLinks, metadata, title]
  )
  const preferredOption = preferredUrl
    ? options.find((option) => option.url === preferredUrl) ?? null
    : null
  const currentOption =
    preferredOption || (options.length === 1 ? options[0] : null)
  const canChoosePreferred = Boolean(upsertPreferredReferenceUrl)
  const canAddMedia = Boolean(addPieceMediaLink && allowAddMediaLink)

  if (options.length === 0 && !canAddMedia) {
    return null
  }

  const directTriggerClassName =
    triggerClassName ??
    (compact
      ? "text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
      : buttonStyles.secondary)

  return (
    <div className={joinClasses("min-w-0", className)}>
      {currentOption ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <ReferenceOpenButton
            option={currentOption}
            title={title}
            pieceId={pieceId}
            redirectTo={redirectTo}
            savedLoops={savedLoops}
            className={directTriggerClassName}
            openLabel={openLabel}
          />

          {showPickerTrigger &&
          (options.length > 1 || canAddMedia) &&
          canChoosePreferred ? (
            <button
              type="button"
              className={buttonStyles.text}
              onClick={() => setIsPickerOpen(true)}
            >
              {pickerTriggerLabel}
            </button>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className={directTriggerClassName}
          onClick={() => setIsPickerOpen(true)}
        >
          Choose reference
        </button>
      )}

      <ResponsiveModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        mobileMode="sheet"
        desktopMaxWidth="md:max-w-2xl"
        eyebrow="Reference media"
        title="Choose reference"
        description={title}
        bodyClassName="min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
      >
        {options.length > 0 ? (
          <ul className="divide-y divide-border">
            {options.map((option) => {
              const isPreferred = preferredUrl === option.url
              const label = getOptionLabel(option)

              return (
                <li key={option.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="min-w-0 break-words text-sm font-semibold text-foreground">
                          {label}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {isPreferred ? "Preferred" : option.sourceLabel}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <ReferenceOpenButton
                          option={option}
                          title={title}
                          pieceId={pieceId}
                          redirectTo={redirectTo}
                          savedLoops={savedLoops}
                          className={buttonStyles.secondary}
                          openLabel={openLabel}
                        />

                        {upsertPreferredReferenceUrl && !isPreferred ? (
                          <form action={upsertPreferredReferenceUrl}>
                            <input type="hidden" name="piece_id" value={pieceId} />
                            <input
                              type="hidden"
                              name="redirect_to"
                              value={redirectTo}
                            />
                            <input
                              type="hidden"
                              name="preferred_reference_label"
                              value={label}
                            />
                            <input
                              type="hidden"
                              name="preferred_reference_url"
                              value={option.url}
                            />
                            <SubmitButton
                              label="Set preferred"
                              pendingLabel="Saving..."
                              className={buttonStyles.primary}
                            />
                          </form>
                        ) : null}

                        {removePreferredReferenceUrl && preferredUrl && isPreferred ? (
                          <form action={removePreferredReferenceUrl}>
                            <input type="hidden" name="piece_id" value={pieceId} />
                            <input
                              type="hidden"
                              name="redirect_to"
                              value={redirectTo}
                            />
                            <SubmitButton
                              label="Remove preferred"
                              pendingLabel="Removing..."
                              className={buttonStyles.destructiveSecondary}
                            />
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            No reference media has been saved for this tune yet.
          </p>
        )}

        {canAddMedia ? (
          <form
            action={addPieceMediaLink}
            className="mt-5 border-t border-border pt-5"
          >
            <input type="hidden" name="piece_id" value={pieceId} />
            <input type="hidden" name="redirect_to" value={redirectTo} />

            <div className="space-y-3">
              <input
                name="label"
                placeholder="Label, eg Session video"
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

              <label className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="make_preferred"
                  value="true"
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-[var(--focus-ring)]"
                />
                <span>Make this my preferred reference</span>
              </label>

              <SubmitButton
                label="Add media link"
                pendingLabel="Adding..."
                className={buttonStyles.primary}
              />
            </div>
          </form>
        ) : null}
      </ResponsiveModal>
    </div>
  )
}

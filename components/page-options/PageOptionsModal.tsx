"use client"

import { useMemo, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { updatePagePreferences } from "@/lib/actions/page-preferences"
import type {
  PageColumnMode,
  PageDensity,
  PageLayoutPresetId,
  PageOptionsConfig,
  PageOptionsPreferences,
  PageVisibleSections,
} from "@/lib/page-options/types"

type PageOptionsModalProps = {
  config: PageOptionsConfig
  preferences: PageOptionsPreferences
  redirectTo: string
  buttonLabel?: string
}

const columnOptions: Array<{
  value: PageColumnMode
  label: string
  description: string
}> = [
  {
    value: "auto",
    label: "Auto",
    description: "Let the app choose the best layout for the screen.",
  },
  {
    value: "compact",
    label: "Compact",
    description: "One-column layout with maximum focus.",
  },
  {
    value: "comfortable",
    label: "Comfortable",
    description: "Two-column layout for a calmer working surface.",
  },
  {
    value: "wide",
    label: "Wide",
    description: "Three-column dashboard layout where space allows.",
  },
]

const densityOptions: Array<{
  value: PageDensity
  label: string
  description: string
}> = [
  {
    value: "spacious",
    label: "Spacious",
    description: "Larger panels and less visual compression.",
  },
  {
    value: "standard",
    label: "Standard",
    description: "The normal app rhythm.",
  },
  {
    value: "compact",
    label: "Compact",
    description: "Tighter panels for denser management pages.",
  },
]

function cloneVisibleSections(sections: PageVisibleSections) {
  return { ...sections }
}

export default function PageOptionsModal({
  config,
  preferences,
  redirectTo,
  buttonLabel = "Page Options",
}: PageOptionsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [layoutPreset, setLayoutPreset] = useState<PageLayoutPresetId>(
    preferences.layoutPreset
  )
  const [columnMode, setColumnMode] = useState<PageColumnMode>(
    preferences.columnMode
  )
  const [density, setDensity] = useState<PageDensity>(preferences.density)
  const [visibleSections, setVisibleSections] = useState<PageVisibleSections>(
    () => cloneVisibleSections(preferences.visibleSections)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedPreset = useMemo(
    () => config.presets.find((preset) => preset.id === layoutPreset),
    [config.presets, layoutPreset]
  )

  function closeModal() {
    if (isSubmitting) return
    setIsOpen(false)
  }

  function applyPreset(presetId: PageLayoutPresetId) {
    const preset = config.presets.find((item) => item.id === presetId)

    if (!preset) return

    setLayoutPreset(preset.id)
    setColumnMode(preset.preferences.columnMode)
    setDensity(preset.preferences.density)
    setVisibleSections(cloneVisibleSections(preset.preferences.visibleSections))
  }

  function toggleSection(sectionId: string) {
    setVisibleSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsSubmitting(false)
          setIsOpen(true)
        }}
        className={buttonStyles.secondaryStrong}
      >
        {buttonLabel}
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={closeModal}
        closeDisabled={isSubmitting}
        closeOnOverlayClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-4xl"
        eyebrow="Page Options"
        title={config.title}
        description={config.description}
      >
        <form
          action={async (formData: FormData) => {
            setIsSubmitting(true)
            await updatePagePreferences(formData)
          }}
          className="space-y-7"
        >
          <input type="hidden" name="page_key" value={config.pageKey} />
          <input type="hidden" name="redirect_to" value={redirectTo} />

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Layout preset
            </h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {config.presets.map((preset) => (
                <label
                  key={preset.id}
                  className={joinClasses(
                    "cursor-pointer rounded-2xl border p-4 transition hover:bg-muted",
                    layoutPreset === preset.id
                      ? "border-primary bg-muted"
                      : "border-border bg-background/70"
                  )}
                >
                  <input
                    type="radio"
                    name="layout_preset"
                    value={preset.id}
                    checked={layoutPreset === preset.id}
                    onChange={() => applyPreset(preset.id)}
                    className="sr-only"
                  />

                  <span className="block text-sm font-semibold text-foreground">
                    {preset.label}
                  </span>

                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {preset.description}
                  </span>
                </label>
              ))}
            </div>

            {selectedPreset ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Current preset:{" "}
                <span className="font-medium text-foreground">
                  {selectedPreset.label}
                </span>
              </p>
            ) : null}
          </section>

          {config.allowColumns ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Columns
              </h3>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {columnOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4"
                  >
                    <input
                      type="radio"
                      name="column_mode"
                      value={option.value}
                      checked={columnMode === option.value}
                      onChange={() => setColumnMode(option.value)}
                      className="mt-1 h-4 w-4 accent-primary"
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
            </section>
          ) : (
            <input type="hidden" name="column_mode" value={columnMode} />
          )}

          {config.allowDensity ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Density
              </h3>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {densityOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4"
                  >
                    <input
                      type="radio"
                      name="density"
                      value={option.value}
                      checked={density === option.value}
                      onChange={() => setDensity(option.value)}
                      className="mt-1 h-4 w-4 accent-primary"
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
            </section>
          ) : (
            <input type="hidden" name="density" value={density} />
          )}

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sections shown
            </h3>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {config.sections.map((section) => (
                <label
                  key={section.id}
                  className="flex gap-3 rounded-2xl border border-border bg-background/70 p-4"
                >
                  <input
                    type="checkbox"
                    name={`section_${section.id}`}
                    value="true"
                    checked={Boolean(visibleSections[section.id])}
                    onChange={() => toggleSection(section.id)}
                    className="mt-1 h-4 w-4 rounded border-border accent-primary"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {section.label}
                      {section.isCore ? (
                        <span className="ml-2 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Core
                        </span>
                      ) : null}
                    </span>

                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {section.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
            {config.helperText}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SubmitButton
              label="Save Page Options"
              pendingLabel="Saving..."
              className={buttonStyles.primary}
            />

            <button
              type="button"
              onClick={closeModal}
              className={buttonStyles.secondary}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>

        <form
          action={async (formData: FormData) => {
            setIsSubmitting(true)
            await updatePagePreferences(formData)
          }}
          className="mt-3"
        >
          <input type="hidden" name="page_key" value={config.pageKey} />
          <input type="hidden" name="redirect_to" value={redirectTo} />
          <input type="hidden" name="reset_preferences" value="true" />

          <SubmitButton
            label="Reset to default"
            pendingLabel="Resetting..."
            className={buttonStyles.text}
          />
        </form>
      </ResponsiveModal>
    </>
  )
}
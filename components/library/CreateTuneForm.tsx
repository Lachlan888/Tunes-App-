"use client"

import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import { KEY_OPTIONS } from "@/lib/music/keys"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type LearningListOption = {
  id: number
  name: string
}

type CreateTuneFormProps = {
  createTune: (formData: FormData) => void | Promise<void>
  styleOptions: StyleOption[]
  learningLists: LearningListOption[]
  redirectTo?: string
  onSubmitStart?: () => void
}

const inputClass =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const helperClass = "mt-2 text-sm leading-6 text-muted-foreground"

const fieldsetClass =
  "rounded-2xl border border-border bg-background/70 p-4"

const advancedSectionClass =
  "rounded-2xl border border-border bg-background/70 p-4"

const LORE_CATEGORY_OPTIONS = [
  { value: "region", label: "Region" },
  { value: "informant", label: "Source" },
  { value: "collector", label: "Collector" },
  { value: "alternate_title", label: "Alternate title" },
  { value: "tune_family", label: "Tune family" },
  { value: "story_folklore_note", label: "Story / folklore note" },
]

export default function CreateTuneForm({
  createTune,
  styleOptions,
  learningLists,
  redirectTo = "/library",
  onSubmitStart,
}: CreateTuneFormProps) {
  const [postCreateAction, setPostCreateAction] = useState<
    "none" | "known" | "practice"
  >("none")
  const [addToList, setAddToList] = useState(false)
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false)

  return (
    <form
      action={async (formData: FormData) => {
        onSubmitStart?.()
        await createTune(formData)
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <input type="hidden" name="redirect_to" value={redirectTo} />

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                placeholder="e.g. Soldier’s Joy"
                className={inputClass}
                required
              />
              <p className={helperClass}>
                Use the common tune title only. Avoid adding key names,
                instrument notes, or version labels in the title.
              </p>
            </div>

            <div>
              <label htmlFor="key" className="mb-2 block text-sm font-medium">
                Key
              </label>
              <select
                id="key"
                name="key"
                defaultValue=""
                className={inputClass}
              >
                {KEY_OPTIONS.map((key) => (
                  <option key={key || "none"} value={key}>
                    {key === "" ? "No key" : key}
                  </option>
                ))}
              </select>
              <p className={helperClass}>
                Optional. Use the common playing key for this tune entry if that
                is musically relevant.
              </p>
            </div>

            <div>
              <label
                htmlFor="time_signature"
                className="mb-2 block text-sm font-medium"
              >
                Time signature
              </label>
              <input
                id="time_signature"
                name="time_signature"
                placeholder="e.g. 4/4 or 6/8"
                className={inputClass}
                pattern="^\d+/\d+$"
                title="Use format like 4/4 or 6/8"
              />
              <p className={helperClass}>
                Optional. Enter as numbers with a slash, for example 4/4, 3/4,
                or 6/8.
              </p>
            </div>

            <div>
              <label
                htmlFor="composer"
                className="mb-2 block text-sm font-medium"
              >
                Composer
              </label>
              <input
                id="composer"
                name="composer"
                placeholder="e.g. Bill Monroe, trad., unknown"
                className={inputClass}
              />
              <p className={helperClass}>
                Optional. Use this only where a composer or useful attribution
                is known.
              </p>
            </div>

            <div>
              <label
                htmlFor="reference_url"
                className="mb-2 block text-sm font-medium"
              >
                Primary reference URL
              </label>
              <input
                id="reference_url"
                name="reference_url"
                type="url"
                placeholder="e.g. YouTube, archive, or recording link"
                className={inputClass}
              />
              <p className={helperClass}>
                Optional. Add one useful reference link for this tune, such as a
                YouTube video, field recording, or other version-defining
                source.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <button
                type="button"
                onClick={() => setShowAdvancedDetails((current) => !current)}
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={showAdvancedDetails}
              >
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Advanced details
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                    Add optional media, sheet music, sources, or lore while
                    creating the tune.
                  </span>
                </span>

                <span className="rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-foreground">
                  {showAdvancedDetails ? "Hide" : "Show"}
                </span>
              </button>

              {showAdvancedDetails && (
                <div className="mt-5 space-y-4">
                  <section className={advancedSectionClass}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Extra media link
                    </h3>
                    <p className={helperClass}>
                      Use this for another recording, video, or listening
                      reference. The primary reference URL above will still
                      remain the main tune reference.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <label
                          htmlFor="advanced_media_label"
                          className="mb-2 block text-sm font-medium"
                        >
                          Media label
                        </label>
                        <input
                          id="advanced_media_label"
                          name="advanced_media_label"
                          placeholder="e.g. Session video"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="advanced_media_url"
                          className="mb-2 block text-sm font-medium"
                        >
                          Media URL
                        </label>
                        <input
                          id="advanced_media_url"
                          name="advanced_media_url"
                          type="url"
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>

                  <section className={advancedSectionClass}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Sheet music / tab
                    </h3>
                    <p className={helperClass}>
                      Add one notation, tab, transcription, or source page link
                      now. More can still be added later on the tune detail
                      page.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <label
                          htmlFor="advanced_sheet_music_label"
                          className="mb-2 block text-sm font-medium"
                        >
                          Sheet music label
                        </label>
                        <input
                          id="advanced_sheet_music_label"
                          name="advanced_sheet_music_label"
                          placeholder="e.g. Mandolin tab"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="advanced_sheet_music_url"
                          className="mb-2 block text-sm font-medium"
                        >
                          Sheet music URL
                        </label>
                        <input
                          id="advanced_sheet_music_url"
                          name="advanced_sheet_music_url"
                          type="url"
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>

                  <section className={advancedSectionClass}>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Source or lore entry
                    </h3>
                    <p className={helperClass}>
                      Add one source note, alternate title, regional note,
                      collector note, tune-family link, or bit of folklore.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <label
                          htmlFor="advanced_lore_category"
                          className="mb-2 block text-sm font-medium"
                        >
                          Lore category
                        </label>
                        <select
                          id="advanced_lore_category"
                          name="advanced_lore_category"
                          defaultValue=""
                          className={inputClass}
                        >
                          <option value="">Choose a category</option>
                          {LORE_CATEGORY_OPTIONS.map((category) => (
                            <option
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="advanced_lore_text"
                          className="mb-2 block text-sm font-medium"
                        >
                          Lore text
                        </label>
                        <textarea
                          id="advanced_lore_text"
                          name="advanced_lore_text"
                          rows={4}
                          placeholder="Add a source, alternate title, regional note, tune-family link, or bit of folklore"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <fieldset className={fieldsetClass}>
              <legend className="px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Styles
              </legend>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                {styleOptions.map((style) => (
                  <label key={style.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="style_ids" value={style.id} />
                    <span>{style.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className={fieldsetClass}>
              <legend className="px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                After create
              </legend>

              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="post_create_action"
                    value="none"
                    checked={postCreateAction === "none"}
                    onChange={() => setPostCreateAction("none")}
                  />
                  <span>Do nothing</span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="post_create_action"
                    value="known"
                    checked={postCreateAction === "known"}
                    onChange={() => setPostCreateAction("known")}
                  />
                  <span>Add to known</span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="post_create_action"
                    value="practice"
                    checked={postCreateAction === "practice"}
                    onChange={() => setPostCreateAction("practice")}
                  />
                  <span>Start Practice</span>
                </label>
              </div>
            </fieldset>

            <fieldset className={fieldsetClass}>
              <legend className="px-1 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Also
              </legend>

              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="add_to_list"
                  value="true"
                  checked={addToList}
                  onChange={(event) => setAddToList(event.target.checked)}
                />
                <span>Add to list</span>
              </label>

              {addToList && (
                <div className="mt-3">
                  <label
                    htmlFor="learning_list_id"
                    className="mb-2 block text-sm font-medium"
                  >
                    List
                  </label>

                  <select
                    id="learning_list_id"
                    name="learning_list_id"
                    defaultValue=""
                    className={inputClass}
                    required={addToList}
                  >
                    <option value="">Choose a list</option>
                    {learningLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>

                  {learningLists.length === 0 && (
                    <p className={helperClass}>
                      You do not have any lists yet.
                    </p>
                  )}
                </div>
              )}
            </fieldset>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border bg-card px-6 py-5">
        <div className="flex justify-end">
          <SubmitButton
            label="Create"
            pendingLabel="Creating..."
            className="rounded-full border border-primary bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
    </form>
  )
}
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
                htmlFor="reference_url"
                className="mb-2 block text-sm font-medium"
              >
                Reference URL
              </label>
              <input
                id="reference_url"
                name="reference_url"
                placeholder="e.g. YouTube, archive, or recording link"
                className={inputClass}
              />
              <p className={helperClass}>
                Optional. Add one useful reference link for this tune, such as a
                YouTube video, field recording, or other version-defining
                source.
              </p>
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
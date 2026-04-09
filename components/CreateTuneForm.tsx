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
      className="space-y-4"
    >
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          placeholder="e.g. Soldier’s Joy"
          className="w-full border p-2"
          required
        />
        <p className="mt-2 text-sm text-gray-600">
          Use the common tune title only. Avoid adding key names, instrument
          notes, or version labels in the title.
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
          className="w-full border p-2"
        >
          {KEY_OPTIONS.map((key) => (
            <option key={key || "none"} value={key}>
              {key === "" ? "No key" : key}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-gray-600">
          Optional. Use the common playing key for this tune entry if that is
          musically relevant.
        </p>
      </div>

      <fieldset className="border p-3">
        <legend className="px-1 font-medium">Styles</legend>

        <div className="grid gap-2 sm:grid-cols-2">
          {styleOptions.map((style) => (
            <label key={style.id} className="flex items-center gap-2">
              <input type="checkbox" name="style_ids" value={style.id} />
              <span>{style.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

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
          className="w-full border p-2"
          pattern="^\d+/\d+$"
          title="Use format like 4/4 or 6/8"
        />
        <p className="mt-2 text-sm text-gray-600">
          Optional. Enter as numbers with a slash, for example 4/4, 3/4, or
          6/8.
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
          className="w-full border p-2"
        />
        <p className="mt-2 text-sm text-gray-600">
          Optional. Add one useful reference link for this tune, such as a
          YouTube video, field recording, or other version-defining source.
        </p>
      </div>

      <fieldset className="border p-3">
        <legend className="px-1 font-medium">After create</legend>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="post_create_action"
              value="none"
              checked={postCreateAction === "none"}
              onChange={() => setPostCreateAction("none")}
            />
            <span>Do nothing</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="post_create_action"
              value="known"
              checked={postCreateAction === "known"}
              onChange={() => setPostCreateAction("known")}
            />
            <span>Add to known</span>
          </label>

          <label className="flex items-center gap-2">
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

      <fieldset className="border p-3">
        <legend className="px-1 font-medium">Also</legend>

        <label className="flex items-center gap-2">
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
              className="w-full border p-2"
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
              <p className="mt-2 text-sm text-gray-600">
                You do not have any lists yet.
              </p>
            )}
          </div>
        )}
      </fieldset>

      <SubmitButton
        label="Create"
        pendingLabel="Creating..."
        className="bg-black px-4 py-2 text-white"
      />
    </form>
  )
}
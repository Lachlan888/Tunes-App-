"use client"

import { useMemo, useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import TuneSearchSelect from "@/components/TuneSearchSelect"
import {
  createBadge,
  deleteBadge,
  updateBadge,
} from "@/lib/actions/badges"
import type { CreateBadgeData, EditBadgeData } from "@/lib/loaders/badges"
import type { Badge, BadgeCategory, BadgeCondition } from "@/lib/types"

type CreateBadgeFormProps = {
  data: CreateBadgeData | Extract<EditBadgeData, { status: "loaded" }>
  mode?: "create" | "edit"
}

type ConditionType =
  | "know_all_tunes_in_list"
  | "know_selected_tunes"
  | "known_tune_count"
  | "added_media_links"
  | "added_lore_entries"
  | "added_missing_details"

type ConditionOption = {
  value: ConditionType
  label: string
  help: string
}

const CONDITIONS_BY_CATEGORY: Record<BadgeCategory, ConditionOption[]> = {
  repertoire: [
    {
      value: "know_all_tunes_in_list",
      label: "Know every tune in a public list",
      help: "Best for canon, session, artist, or tradition-based repertoire badges.",
    },
    {
      value: "know_selected_tunes",
      label: "Know selected tunes",
      help: "Best for a hand-picked tune cluster.",
    },
    {
      value: "known_tune_count",
      label: "Know at least X tunes matching filters",
      help: "Best for breadth within a key, style, or time signature.",
    },
  ],
  media: [
    {
      value: "added_media_links",
      label: "Add reference media links",
      help: "Recognise users who add useful listening or video references.",
    },
  ],
  lore: [
    {
      value: "added_lore_entries",
      label: "Add lore entries",
      help: "Recognise cultural, historical, source, or variant knowledge.",
    },
  ],
  catalogue: [
    {
      value: "added_missing_details",
      label: "Add missing tune details",
      help: "Recognise users who improve incomplete catalogue metadata.",
    },
  ],
  practice: [],
  social: [],
  recovery: [],
  collaboration: [],
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const labelClassName =
  "text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"

const panelClassName =
  "rounded-3xl border border-border bg-card p-6 shadow-sm"

const primaryButtonClassName =
  "rounded-full border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

const dangerButtonClassName =
  "rounded-full border border-destructive bg-destructive px-5 py-2.5 text-sm font-medium text-destructive-foreground shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

function getBadge(data: CreateBadgeFormProps["data"]): Badge | null {
  if ("badge" in data && data.badge) {
    return data.badge
  }

  return null
}

function getAwardCount(data: CreateBadgeFormProps["data"]) {
  if ("awardCount" in data) {
    return data.awardCount
  }

  return 0
}

function getFirstCondition(badge: Badge | null): BadgeCondition | null {
  return badge?.condition_logic.conditions?.[0] ?? null
}

function getInitialConditionType(condition: BadgeCondition | null): ConditionType {
  return condition?.type ?? "know_all_tunes_in_list"
}

function getInitialCategory(badge: Badge | null): BadgeCategory {
  if (
    badge?.category === "repertoire" ||
    badge?.category === "media" ||
    badge?.category === "lore" ||
    badge?.category === "catalogue"
  ) {
    return badge.category
  }

  return "repertoire"
}

function getInitialSelectedPieces({
  condition,
  pieces,
}: {
  condition: BadgeCondition | null
  pieces: CreateBadgeData["pieces"]
}) {
  if (condition?.type !== "know_selected_tunes") {
    return []
  }

  const selectedPieceIds = new Set(condition.piece_ids)

  return pieces.filter((piece) => selectedPieceIds.has(piece.id))
}

export default function CreateBadgeForm({
  data,
  mode = "create",
}: CreateBadgeFormProps) {
  const badge = getBadge(data)
  const awardCount = getAwardCount(data)
  const firstCondition = getFirstCondition(badge)
  const conditionIsLocked = mode === "edit" && awardCount > 0

  const [category, setCategory] = useState<BadgeCategory>(
    getInitialCategory(badge)
  )

  const availableConditions = useMemo(
    () => CONDITIONS_BY_CATEGORY[category] ?? [],
    [category]
  )

  const [conditionType, setConditionType] = useState<ConditionType>(
    getInitialConditionType(firstCondition)
  )

  function handleCategoryChange(nextCategory: BadgeCategory) {
    const nextConditions = CONDITIONS_BY_CATEGORY[nextCategory] ?? []
    setCategory(nextCategory)

    if (nextConditions[0]) {
      setConditionType(nextConditions[0].value)
    }
  }

  const selectedCondition = availableConditions.find(
    (condition) => condition.value === conditionType
  )

  const action = mode === "edit" ? updateBadge : createBadge
  const submitLabel = mode === "edit" ? "Save badge" : "Create badge"
  const pendingLabel = mode === "edit" ? "Saving badge..." : "Creating badge..."

  return (
    <>
      <form action={action} className="space-y-8">
        <input
          type="hidden"
          name="redirect_to"
          value={mode === "edit" && badge ? `/badges/${badge.slug}/edit` : "/badges/new"}
        />

        {badge ? <input type="hidden" name="badge_id" value={badge.id} /> : null}

        <section className={panelClassName}>
          <h2 className={labelClassName}>Badge identity</h2>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground"
              >
                Badge name
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={badge?.name ?? ""}
                placeholder="e.g. Monroe Mayhem"
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-foreground"
              >
                Badge type
              </label>
              <select
                id="category"
                name="category"
                value={category}
                disabled={conditionIsLocked}
                onChange={(event) =>
                  handleCategoryChange(event.target.value as BadgeCategory)
                }
                className={inputClassName}
              >
                <option value="repertoire">Repertoire</option>
                <option value="media">Media</option>
                <option value="lore">Lore</option>
                <option value="catalogue">Catalogue</option>
              </select>

              {conditionIsLocked ? (
                <input type="hidden" name="category" value={category} />
              ) : null}
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground"
            >
              Short description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              required
              defaultValue={badge?.description ?? ""}
              placeholder="e.g. Recognises players who know a core set of Bill Monroe tunes."
              className={inputClassName}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              This is the public explanation users will see on the badge.
            </p>
          </div>

          <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
            Badges are public. You define the conditions. When another user
            meets the condition, the badge can be awarded automatically and
            attributed to you.
          </p>

          {conditionIsLocked ? (
            <p className="mt-4 rounded-2xl border border-warning bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              This badge has already been awarded to {awardCount} user
              {awardCount === 1 ? "" : "s"}, so its unlock condition is locked.
              You can still edit the name and description.
            </p>
          ) : null}
        </section>

        <section className={panelClassName}>
          <h2 className={labelClassName}>Unlock condition</h2>

          <div className="mt-5 space-y-2">
            <label
              htmlFor="condition_type"
              className="block text-sm font-medium text-foreground"
            >
              Condition
            </label>
            <select
              id="condition_type"
              name="condition_type"
              value={conditionType}
              disabled={conditionIsLocked}
              onChange={(event) =>
                setConditionType(event.target.value as ConditionType)
              }
              className={inputClassName}
            >
              {availableConditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>

            {conditionIsLocked ? (
              <input type="hidden" name="condition_type" value={conditionType} />
            ) : null}

            {selectedCondition ? (
              <p className="text-xs leading-5 text-muted-foreground">
                {selectedCondition.help}
              </p>
            ) : null}
          </div>

          <div className="mt-6">
            {conditionType === "know_all_tunes_in_list" ? (
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Public list
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  The badge is awarded when the user knows every tune in this
                  list.
                </p>

                <select
                  name="source_list_id"
                  disabled={conditionIsLocked}
                  defaultValue={
                    firstCondition?.type === "know_all_tunes_in_list"
                      ? firstCondition.list_id
                      : ""
                  }
                  className={`${inputClassName} mt-4`}
                >
                  <option value="">Choose a public list</option>
                  {data.publicLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>

                {conditionIsLocked &&
                firstCondition?.type === "know_all_tunes_in_list" ? (
                  <input
                    type="hidden"
                    name="source_list_id"
                    value={firstCondition.list_id}
                  />
                ) : null}
              </div>
            ) : null}

            {conditionType === "know_selected_tunes" ? (
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Selected tunes
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Search for tunes by title and add the ones required for this
                  badge.
                </p>

                <div className="mt-5">
                  <TuneSearchSelect
                    pieces={data.pieces}
                    inputName="piece_ids"
                    mode="multiple"
                    initialSelectedPieces={getInitialSelectedPieces({
                      condition: firstCondition,
                      pieces: data.pieces,
                    })}
                    selectedLabel="Tunes required for this badge"
                    emptySelectionLabel="Search for tunes and add them to the badge condition."
                  />
                </div>
              </div>
            ) : null}

            {conditionType === "known_tune_count" ? (
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Known tune count
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  The badge is awarded when the user knows enough tunes matching
                  these filters.
                </p>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <input
                    name="known_tune_count"
                    type="number"
                    min={1}
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "known_tune_count"
                        ? firstCondition.count
                        : ""
                    }
                    placeholder="e.g. 20"
                    className={inputClassName}
                  />

                  {conditionIsLocked &&
                  firstCondition?.type === "known_tune_count" ? (
                    <input
                      type="hidden"
                      name="known_tune_count"
                      value={firstCondition.count}
                    />
                  ) : null}

                  <select
                    name="filter_key"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "known_tune_count"
                        ? firstCondition.filters?.key ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any key</option>
                    {data.keyOptions.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>

                  <select
                    name="filter_style"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "known_tune_count"
                        ? firstCondition.filters?.style ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any style</option>
                    {data.styleOptions.map((style) => (
                      <option key={style.id} value={style.label}>
                        {style.label}
                      </option>
                    ))}
                  </select>

                  <select
                    name="filter_time_signature"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "known_tune_count"
                        ? firstCondition.filters?.time_signature ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any time signature</option>
                    {data.timeSignatureOptions.map((timeSignature) => (
                      <option key={timeSignature} value={timeSignature}>
                        {timeSignature}
                      </option>
                    ))}
                  </select>

                  {conditionIsLocked &&
                  firstCondition?.type === "known_tune_count" ? (
                    <>
                      <input
                        type="hidden"
                        name="filter_key"
                        value={firstCondition.filters?.key ?? ""}
                      />
                      <input
                        type="hidden"
                        name="filter_style"
                        value={firstCondition.filters?.style ?? ""}
                      />
                      <input
                        type="hidden"
                        name="filter_time_signature"
                        value={firstCondition.filters?.time_signature ?? ""}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            ) : null}

            {conditionType === "added_media_links" ? (
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Reference media
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  The badge is awarded for adding reference media links.
                </p>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <input
                    name="media_link_count"
                    type="number"
                    min={1}
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_media_links"
                        ? firstCondition.count
                        : ""
                    }
                    placeholder="e.g. 25"
                    className={inputClassName}
                  />

                  <select
                    name="media_style"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_media_links"
                        ? firstCondition.filters?.style ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any style</option>
                    {data.styleOptions.map((style) => (
                      <option key={style.id} value={style.label}>
                        {style.label}
                      </option>
                    ))}
                  </select>

                  <select
                    name="media_list_id"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_media_links"
                        ? firstCondition.filters?.list_id ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any list</option>
                    {data.publicLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </select>

                  <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      name="only_previously_missing_media"
                      value="true"
                      disabled={conditionIsLocked}
                      defaultChecked={
                        firstCondition?.type === "added_media_links"
                          ? Boolean(
                              firstCondition.filters
                                ?.only_previously_missing_media
                            )
                          : false
                      }
                      className="mt-1"
                    />
                    <span>
                      Only count tunes that were missing media. This is
                      approximate until missing-media history is fully tracked.
                    </span>
                  </label>
                </div>
              </div>
            ) : null}

            {conditionType === "added_lore_entries" ? (
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold text-foreground">Lore</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  The badge is awarded for adding lore entries.
                </p>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <input
                    name="lore_entry_count"
                    type="number"
                    min={1}
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_lore_entries"
                        ? firstCondition.count
                        : ""
                    }
                    placeholder="e.g. 10"
                    className={inputClassName}
                  />

                  <select
                    name="lore_style"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_lore_entries"
                        ? firstCondition.filters?.style ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any style</option>
                    {data.styleOptions.map((style) => (
                      <option key={style.id} value={style.label}>
                        {style.label}
                      </option>
                    ))}
                  </select>

                  <select
                    name="lore_category"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_lore_entries"
                        ? firstCondition.filters?.category ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any lore category</option>
                    <option value="region">Region</option>
                    <option value="informant">Informant</option>
                    <option value="collector">Collector</option>
                    <option value="alternate_title">Alternate title</option>
                    <option value="tune_family">Tune family</option>
                    <option value="story_folklore_note">
                      Story / folklore note
                    </option>
                  </select>
                </div>
              </div>
            ) : null}

            {conditionType === "added_missing_details" ? (
              <div className="rounded-2xl border border-border bg-background/70 p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Missing details
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  The badge is awarded for improving missing tune details.
                </p>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <input
                    name="missing_detail_count"
                    type="number"
                    min={1}
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_missing_details"
                        ? firstCondition.count
                        : ""
                    }
                    placeholder="e.g. 15"
                    className={inputClassName}
                  />

                  <select
                    name="missing_detail_style"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_missing_details"
                        ? firstCondition.filters?.style ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any style</option>
                    {data.styleOptions.map((style) => (
                      <option key={style.id} value={style.label}>
                        {style.label}
                      </option>
                    ))}
                  </select>

                  <select
                    name="missing_detail_field"
                    disabled={conditionIsLocked}
                    defaultValue={
                      firstCondition?.type === "added_missing_details"
                        ? firstCondition.filters?.field_name ?? ""
                        : ""
                    }
                    className={inputClassName}
                  >
                    <option value="">Any field</option>
                    <option value="key">Key</option>
                    <option value="style">Style</option>
                    <option value="time_signature">Time signature</option>
                    <option value="reference_url">Reference URL</option>
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <SubmitButton
            label={submitLabel}
            pendingLabel={pendingLabel}
            className={primaryButtonClassName}
          />
        </div>
      </form>

      {mode === "edit" && badge ? (
        <section className={`${panelClassName} mt-8 border-destructive`}>
          <h2 className={labelClassName}>Delete badge</h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Delete this badge permanently. This removes the badge, its recipient
            records, and linked badge notifications.
          </p>

          <form action={deleteBadge} className="mt-5">
            <input type="hidden" name="badge_id" value={badge.id} />

            <SubmitButton
              label="Delete badge"
              pendingLabel="Deleting badge..."
              className={dangerButtonClassName}
            />
          </form>
        </section>
      ) : null}
    </>
  )
}
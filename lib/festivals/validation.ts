import type {
  FestivalCollectionKind,
  FestivalLifecycle,
  FestivalSessionStatus,
} from "@/lib/types/festivals"

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/

export class FestivalValidationError extends Error {
  readonly code: string

  constructor(code: string) {
    super(code)
    this.code = code
    this.name = "FestivalValidationError"
  }
}

function requiredText(value: unknown, field: string, max: number) {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text || text.length > max) throw new FestivalValidationError(`invalid_${field}`)
  return text
}

function optionalText(value: unknown, field: string, max: number) {
  if (value == null || value === "") return null
  return requiredText(value, field, max)
}

function optionalUrl(value: unknown, field: string) {
  const text = optionalText(value, field, 2048)
  if (!text) return null
  try {
    const parsed = new URL(text)
    if (parsed.protocol !== "https:") throw new Error("protocol")
  } catch {
    throw new FestivalValidationError(`invalid_${field}`)
  }
  return text
}

function positiveInteger(value: unknown, field: string) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) throw new FestivalValidationError(`invalid_${field}`)
  return parsed
}

function order(value: unknown) {
  const parsed = value == null || value === "" ? 0 : Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) throw new FestivalValidationError("invalid_editorial_order")
  return parsed
}

function optionalUuid(value: unknown, field: string) {
  const text = optionalText(value, field, 36)
  if (!text) return null
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw new FestivalValidationError(`invalid_${field}`)
  }
  return text
}

export function validateFestivalSlug(value: unknown) {
  const slug = requiredText(value, "slug", 80).toLowerCase()
  if (slug.length < 3 || !SLUG.test(slug)) throw new FestivalValidationError("invalid_slug")
  return slug
}

export function validateFestivalHubInput(input: Record<string, unknown>) {
  const lifecycle = (input.lifecycle ?? "draft") as FestivalLifecycle
  if (!["draft", "published", "archived"].includes(lifecycle)) {
    throw new FestivalValidationError("invalid_lifecycle")
  }
  const timezone = requiredText(input.timezone ?? "Australia/Melbourne", "timezone", 100)
  try {
    new Intl.DateTimeFormat("en-AU", { timeZone: timezone }).format()
  } catch {
    throw new FestivalValidationError("invalid_timezone")
  }
  const brandingImageUrl = optionalUrl(input.branding_image_url, "branding_image_url")
  const brandingAlt = optionalText(input.branding_alt, "branding_alt", 240)
  if (Boolean(brandingImageUrl) !== Boolean(brandingAlt)) {
    throw new FestivalValidationError("incomplete_branding")
  }
  const snapshot = optionalText(input.programme_snapshot_date, "programme_snapshot_date", 10)
  if (snapshot && !DATE.test(snapshot)) throw new FestivalValidationError("invalid_programme_snapshot_date")
  return {
    slug: validateFestivalSlug(input.slug),
    name: requiredText(input.name, "name", 120),
    description: optionalText(input.description, "description", 4000),
    timezone,
    branding_image_url: brandingImageUrl,
    branding_alt: brandingAlt,
    programme_url: optionalUrl(input.programme_url, "programme_url"),
    programme_snapshot_date: snapshot,
    curator_credit: optionalText(input.curator_credit, "curator_credit", 160),
    curator_profile_id: optionalUuid(input.curator_profile_id, "curator_profile_id"),
    lifecycle,
    editorial_order: order(input.editorial_order),
  }
}

export function validateFestivalCollectionInput(input: Record<string, unknown>) {
  const kind = (input.collection_kind ?? "general") as FestivalCollectionKind
  if (!["artist", "tradition", "general"].includes(kind)) {
    throw new FestivalValidationError("invalid_collection_kind")
  }
  return {
    festival_id: positiveInteger(input.festival_id, "festival_id"),
    learning_list_id: positiveInteger(input.learning_list_id, "learning_list_id"),
    collection_kind: kind,
    display_title: optionalText(input.display_title, "display_title", 160),
    display_credit: optionalText(input.display_credit, "display_credit", 160),
    profile_id: optionalUuid(input.profile_id, "profile_id"),
    tradition_label: optionalText(input.tradition_label, "tradition_label", 120),
    editorial_order: order(input.editorial_order),
  }
}

export function validateFestivalSessionInput(input: Record<string, unknown>) {
  const status = (input.status ?? "scheduled") as FestivalSessionStatus
  if (!["scheduled", "changed", "cancelled"].includes(status)) {
    throw new FestivalValidationError("invalid_session_status")
  }
  const localDate = optionalText(input.local_date, "local_date", 10)
  const start = optionalText(input.local_start_time, "local_start_time", 8)
  const end = optionalText(input.local_end_time, "local_end_time", 8)
  if (localDate && !DATE.test(localDate)) throw new FestivalValidationError("invalid_local_date")
  if (start && !TIME.test(start)) throw new FestivalValidationError("invalid_local_start_time")
  if (end && !TIME.test(end)) throw new FestivalValidationError("invalid_local_end_time")
  if (end && !start) throw new FestivalValidationError("end_without_start")
  return {
    festival_id: positiveInteger(input.festival_id, "festival_id"),
    title: requiredText(input.title, "title", 160),
    leader_name: optionalText(input.leader_name, "leader_name", 160),
    leader_profile_id: optionalUuid(input.leader_profile_id, "leader_profile_id"),
    venue: optionalText(input.venue, "venue", 160),
    local_date: localDate,
    local_start_time: start,
    local_end_time: end,
    status,
    source_note: optionalText(input.source_note, "source_note", 1000),
    needs_review: input.needs_review === true || input.needs_review === "true",
    editorial_order: order(input.editorial_order),
  }
}

export function validateFestivalSettingsInput(input: Record<string, unknown>) {
  const modeEnabled = input.mode_enabled === true || input.mode_enabled === "true"
  const selected = input.selected_festival_id == null || input.selected_festival_id === ""
    ? null
    : positiveInteger(input.selected_festival_id, "selected_festival_id")
  if (modeEnabled && selected == null) throw new FestivalValidationError("mode_requires_selection")
  return { mode_enabled: modeEnabled, selected_festival_id: selected }
}

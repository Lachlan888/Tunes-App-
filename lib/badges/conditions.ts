import { createClient } from "@/lib/supabase/server"
import type {
  BadgeCondition,
  BadgeConditionLogic,
  BadgeProgressSummary,
} from "@/lib/types"

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

type PieceIdRow = {
  piece_id: number
}

type PieceMetadataRow = {
  id: number
  key: string | null
  style: string | null
  time_signature: string | null
}

type LearningListRow = {
  id: number
  name: string
}

type ActivityEventRow = {
  piece_id: number | null
  metadata: Record<string, unknown> | null
}

function normaliseText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? ""
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function toPositiveInteger(value: unknown) {
  if (typeof value !== "number") return null
  if (!Number.isInteger(value)) return null
  if (value <= 0) return null
  return value
}

function toPositiveIntegerArray(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => toPositiveInteger(item))
    .filter((item): item is number => item !== null)
}

function normaliseCondition(value: unknown): BadgeCondition | null {
  if (!isRecord(value)) return null

  if (value.type === "know_all_tunes_in_list") {
    const listId = toPositiveInteger(value.list_id)
    if (!listId) return null

    return {
      type: "know_all_tunes_in_list",
      list_id: listId,
    }
  }

  if (value.type === "know_selected_tunes") {
    const pieceIds = toPositiveIntegerArray(value.piece_ids)
    if (pieceIds.length === 0) return null

    return {
      type: "know_selected_tunes",
      piece_ids: pieceIds,
    }
  }

  if (value.type === "known_tune_count") {
    const count = toPositiveInteger(value.count)
    if (!count) return null

    const filters = isRecord(value.filters) ? value.filters : {}

    return {
      type: "known_tune_count",
      count,
      filters: {
        key: typeof filters.key === "string" ? filters.key : null,
        style: typeof filters.style === "string" ? filters.style : null,
        time_signature:
          typeof filters.time_signature === "string"
            ? filters.time_signature
            : null,
      },
    }
  }

  if (value.type === "added_media_links") {
    const count = toPositiveInteger(value.count)
    if (!count) return null

    const filters = isRecord(value.filters) ? value.filters : {}

    return {
      type: "added_media_links",
      count,
      filters: {
        style: typeof filters.style === "string" ? filters.style : null,
        only_previously_missing_media:
          typeof filters.only_previously_missing_media === "boolean"
            ? filters.only_previously_missing_media
            : false,
        list_id: toPositiveInteger(filters.list_id) ?? undefined,
      },
    }
  }

  if (value.type === "added_lore_entries") {
    const count = toPositiveInteger(value.count)
    if (!count) return null

    const filters = isRecord(value.filters) ? value.filters : {}

    return {
      type: "added_lore_entries",
      count,
      filters: {
        style: typeof filters.style === "string" ? filters.style : null,
        category: typeof filters.category === "string" ? filters.category : null,
      },
    }
  }

  if (value.type === "added_missing_details") {
    const count = toPositiveInteger(value.count)
    if (!count) return null

    const filters = isRecord(value.filters) ? value.filters : {}

    return {
      type: "added_missing_details",
      count,
      filters: {
        style: typeof filters.style === "string" ? filters.style : null,
        field_name:
          typeof filters.field_name === "string" ? filters.field_name : null,
      },
    }
  }

  return null
}

export function normaliseBadgeConditionLogic(
  value: unknown
): BadgeConditionLogic {
  if (!isRecord(value)) {
    return {
      mode: "all",
      conditions: [],
    }
  }

  const mode = value.mode === "any" ? "any" : "all"
  const conditions = Array.isArray(value.conditions)
    ? value.conditions
        .map((condition) => normaliseCondition(condition))
        .filter((condition): condition is BadgeCondition => condition !== null)
    : []

  return {
    mode,
    conditions,
  }
}

function describeKnownTuneCountTarget(filters?: {
  key?: string | null
  style?: string | null
  time_signature?: string | null
}) {
  const key = filters?.key?.trim()
  const style = filters?.style?.trim()
  const timeSignature = filters?.time_signature?.trim()

  const descriptors = [key, style, timeSignature].filter(Boolean)

  return descriptors.length > 0 ? `${descriptors.join(" ")} ` : ""
}

function describeCondition(condition: BadgeCondition) {
  if (condition.type === "know_all_tunes_in_list") {
    return "Know every tune in a selected list"
  }

  if (condition.type === "know_selected_tunes") {
    return `Know ${condition.piece_ids.length} selected tune${
      condition.piece_ids.length === 1 ? "" : "s"
    }`
  }

  if (condition.type === "known_tune_count") {
    return `Know at least ${condition.count} ${describeKnownTuneCountTarget(
      condition.filters
    )}tune${condition.count === 1 ? "" : "s"}`
  }

  if (condition.type === "added_media_links") {
    const styleText = condition.filters?.style
      ? ` in ${condition.filters.style}`
      : ""
    const missingMediaText = condition.filters?.only_previously_missing_media
      ? " that were missing media"
      : ""
    const listText = condition.filters?.list_id ? " in a selected list" : ""

    return `Add at least ${condition.count} reference media link${
      condition.count === 1 ? "" : "s"
    }${styleText}${listText}${missingMediaText}`
  }

  if (condition.type === "added_lore_entries") {
    const styleText = condition.filters?.style
      ? ` in ${condition.filters.style}`
      : ""
    const categoryText = condition.filters?.category
      ? ` for ${condition.filters.category}`
      : ""

    return `Add at least ${condition.count} lore entr${
      condition.count === 1 ? "y" : "ies"
    }${styleText}${categoryText}`
  }

  if (condition.type === "added_missing_details") {
    const styleText = condition.filters?.style
      ? ` in ${condition.filters.style}`
      : ""
    const fieldText = condition.filters?.field_name
      ? ` for ${condition.filters.field_name}`
      : ""

    return `Add at least ${condition.count} missing tune detail${
      condition.count === 1 ? "" : "s"
    }${styleText}${fieldText}`
  }

  return "Meet this badge condition"
}

export function summariseBadgeConditionLogic(logic: BadgeConditionLogic) {
  const conditions = logic.conditions ?? []

  if (conditions.length === 0) {
    return "No badge conditions have been defined yet."
  }

  if (conditions.length === 1) {
    return describeCondition(conditions[0])
  }

  const joiner = logic.mode === "any" ? " OR " : " AND "

  return conditions.map((condition) => describeCondition(condition)).join(joiner)
}

function combineProgress(
  logic: BadgeConditionLogic,
  progressItems: BadgeProgressSummary[]
): BadgeProgressSummary {
  if (progressItems.length === 0) {
    return {
      isEligible: false,
      isCalculable: true,
      current: 0,
      required: 1,
      label: "No badge conditions have been defined yet.",
    }
  }

  const mode = logic.mode === "any" ? "any" : "all"

  if (mode === "any") {
    const eligibleItem = progressItems.find((item) => item.isEligible)
    const bestItem =
      eligibleItem ??
      [...progressItems].sort((a, b) => {
        const aRatio = a.required > 0 ? a.current / a.required : 0
        const bRatio = b.required > 0 ? b.current / b.required : 0
        return bRatio - aRatio
      })[0]

    return {
      ...bestItem,
      isEligible: Boolean(eligibleItem),
      label: eligibleItem
        ? "Eligible through one badge condition."
        : bestItem.label,
    }
  }

  const current = progressItems.reduce((sum, item) => sum + item.current, 0)
  const required = progressItems.reduce((sum, item) => sum + item.required, 0)
  const missingPieceIds = progressItems.flatMap(
    (item) => item.missingPieceIds ?? []
  )

  return {
    isEligible: progressItems.every((item) => item.isEligible),
    isCalculable: progressItems.every((item) => item.isCalculable),
    current,
    required,
    label: progressItems.every((item) => item.isEligible)
      ? "Eligible for all badge conditions."
      : "Complete all badge conditions.",
    missingPieceIds,
  }
}

async function calculateKnowAllTunesInListProgress({
  supabase,
  userId,
  listId,
}: {
  supabase: SupabaseServerClient
  userId: string
  listId: number
}): Promise<BadgeProgressSummary> {
  const { data: listRow, error: listError } = await supabase
    .from("learning_lists")
    .select("id, name")
    .eq("id", listId)
    .maybeSingle()

  if (listError) {
    throw new Error(listError.message)
  }

  const list = (listRow as LearningListRow | null) ?? null

  const { data: itemRows, error: itemError } = await supabase
    .from("learning_list_items")
    .select("piece_id")
    .eq("learning_list_id", listId)

  if (itemError) {
    throw new Error(itemError.message)
  }

  const pieceIds = Array.from(
    new Set(((itemRows ?? []) as PieceIdRow[]).map((row) => row.piece_id))
  )

  if (pieceIds.length === 0) {
    return {
      isEligible: false,
      isCalculable: true,
      current: 0,
      required: 1,
      label: list
        ? `${list.name} does not contain any tunes yet.`
        : "The linked list does not contain any tunes yet.",
    }
  }

  const { data: knownRows, error: knownError } = await supabase
    .from("user_known_pieces")
    .select("piece_id")
    .eq("user_id", userId)
    .in("piece_id", pieceIds)

  if (knownError) {
    throw new Error(knownError.message)
  }

  const knownPieceIds = new Set(
    ((knownRows ?? []) as PieceIdRow[]).map((row) => row.piece_id)
  )

  const missingPieceIds = pieceIds.filter((pieceId) => !knownPieceIds.has(pieceId))

  return {
    isEligible: missingPieceIds.length === 0,
    isCalculable: true,
    current: knownPieceIds.size,
    required: pieceIds.length,
    label: list
      ? `Know every tune in ${list.name}.`
      : "Know every tune in the selected list.",
    missingPieceIds,
  }
}

async function calculateKnowSelectedTunesProgress({
  supabase,
  userId,
  pieceIds,
}: {
  supabase: SupabaseServerClient
  userId: string
  pieceIds: number[]
}): Promise<BadgeProgressSummary> {
  const uniquePieceIds = Array.from(new Set(pieceIds))

  const { data: knownRows, error: knownError } = await supabase
    .from("user_known_pieces")
    .select("piece_id")
    .eq("user_id", userId)
    .in("piece_id", uniquePieceIds)

  if (knownError) {
    throw new Error(knownError.message)
  }

  const knownPieceIds = new Set(
    ((knownRows ?? []) as PieceIdRow[]).map((row) => row.piece_id)
  )

  const missingPieceIds = uniquePieceIds.filter(
    (pieceId) => !knownPieceIds.has(pieceId)
  )

  return {
    isEligible: missingPieceIds.length === 0,
    isCalculable: true,
    current: knownPieceIds.size,
    required: uniquePieceIds.length,
    label: `Know ${uniquePieceIds.length} selected tune${
      uniquePieceIds.length === 1 ? "" : "s"
    }.`,
    missingPieceIds,
  }
}

async function calculateKnownTuneCountProgress({
  supabase,
  userId,
  condition,
}: {
  supabase: SupabaseServerClient
  userId: string
  condition: Extract<BadgeCondition, { type: "known_tune_count" }>
}): Promise<BadgeProgressSummary> {
  const { data: knownRows, error: knownError } = await supabase
    .from("user_known_pieces")
    .select("piece_id")
    .eq("user_id", userId)

  if (knownError) {
    throw new Error(knownError.message)
  }

  const knownPieceIds = Array.from(
    new Set(((knownRows ?? []) as PieceIdRow[]).map((row) => row.piece_id))
  )

  if (knownPieceIds.length === 0) {
    return {
      isEligible: false,
      isCalculable: true,
      current: 0,
      required: condition.count,
      label: describeCondition(condition),
    }
  }

  const { data: pieceRows, error: pieceError } = await supabase
    .from("pieces")
    .select("id, key, style, time_signature")
    .in("id", knownPieceIds)

  if (pieceError) {
    throw new Error(pieceError.message)
  }

  const filters = condition.filters ?? {}
  const matchingPieces = ((pieceRows ?? []) as PieceMetadataRow[]).filter(
    (piece) => {
      if (filters.key && normaliseText(piece.key) !== normaliseText(filters.key)) {
        return false
      }

      if (
        filters.style &&
        !normaliseText(piece.style).includes(normaliseText(filters.style))
      ) {
        return false
      }

      if (
        filters.time_signature &&
        normaliseText(piece.time_signature) !==
          normaliseText(filters.time_signature)
      ) {
        return false
      }

      return true
    }
  )

  return {
    isEligible: matchingPieces.length >= condition.count,
    isCalculable: true,
    current: matchingPieces.length,
    required: condition.count,
    label: describeCondition(condition),
  }
}

async function getPieceIdsForList(
  supabase: SupabaseServerClient,
  listId: number
) {
  const { data, error } = await supabase
    .from("learning_list_items")
    .select("piece_id")
    .eq("learning_list_id", listId)

  if (error) {
    throw new Error(error.message)
  }

  return new Set(((data ?? []) as PieceIdRow[]).map((row) => row.piece_id))
}

async function getPieceIdsForStyle(
  supabase: SupabaseServerClient,
  pieceIds: number[],
  style: string
) {
  if (pieceIds.length === 0) {
    return new Set<number>()
  }

  const { data, error } = await supabase
    .from("pieces")
    .select("id, style")
    .in("id", pieceIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Set(
    ((data ?? []) as PieceMetadataRow[])
      .filter((piece) =>
        normaliseText(piece.style).includes(normaliseText(style))
      )
      .map((piece) => piece.id)
  )
}

async function calculateMediaLinkProgress({
  supabase,
  userId,
  condition,
}: {
  supabase: SupabaseServerClient
  userId: string
  condition: Extract<BadgeCondition, { type: "added_media_links" }>
}): Promise<BadgeProgressSummary> {
  const { data: mediaRows, error: mediaError } = await supabase
    .from("piece_media_links")
    .select("piece_id")
    .eq("created_by", userId)

  if (mediaError) {
    throw new Error(mediaError.message)
  }

  let matchingPieceIds = ((mediaRows ?? []) as PieceIdRow[]).map(
    (row) => row.piece_id
  )

  if (condition.filters?.list_id) {
    const listPieceIds = await getPieceIdsForList(
      supabase,
      condition.filters.list_id
    )

    matchingPieceIds = matchingPieceIds.filter((pieceId) =>
      listPieceIds.has(pieceId)
    )
  }

  if (condition.filters?.style) {
    const stylePieceIds = await getPieceIdsForStyle(
      supabase,
      matchingPieceIds,
      condition.filters.style
    )

    matchingPieceIds = matchingPieceIds.filter((pieceId) =>
      stylePieceIds.has(pieceId)
    )
  }

  return {
    isEligible: matchingPieceIds.length >= condition.count,
    isCalculable: !condition.filters?.only_previously_missing_media,
    current: matchingPieceIds.length,
    required: condition.count,
    label: condition.filters?.only_previously_missing_media
      ? `${describeCondition(
          condition
        )}. Missing-media history is not fully tracked yet, so this is an approximate count.`
      : describeCondition(condition),
  }
}

async function calculateLoreProgress({
  supabase,
  userId,
  condition,
}: {
  supabase: SupabaseServerClient
  userId: string
  condition: Extract<BadgeCondition, { type: "added_lore_entries" }>
}): Promise<BadgeProgressSummary> {
  let query = supabase
    .from("piece_lore_entries")
    .select("piece_id, category")
    .eq("user_id", userId)

  if (condition.filters?.category) {
    query = query.eq("category", condition.filters.category)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  let rows = ((data ?? []) as Array<{ piece_id: number; category: string }>).map(
    (row) => row.piece_id
  )

  if (condition.filters?.style) {
    const stylePieceIds = await getPieceIdsForStyle(
      supabase,
      rows,
      condition.filters.style
    )

    rows = rows.filter((pieceId) => stylePieceIds.has(pieceId))
  }

  return {
    isEligible: rows.length >= condition.count,
    isCalculable: true,
    current: rows.length,
    required: condition.count,
    label: describeCondition(condition),
  }
}

async function calculateMissingDetailsProgress({
  supabase,
  userId,
  condition,
}: {
  supabase: SupabaseServerClient
  userId: string
  condition: Extract<BadgeCondition, { type: "added_missing_details" }>
}): Promise<BadgeProgressSummary> {
  const { data, error } = await supabase
    .from("user_activity_events")
    .select("piece_id, metadata")
    .eq("user_id", userId)
    .eq("event_type", "piece_details_added")

  if (error) {
    throw new Error(error.message)
  }

  let rows = (data ?? []) as ActivityEventRow[]

  if (condition.filters?.field_name) {
    rows = rows.filter((row) => {
      const fields = Array.isArray(row.metadata?.fields)
        ? row.metadata?.fields
        : []

      return fields.includes(condition.filters?.field_name)
    })
  }

  if (condition.filters?.style) {
    const pieceIds = rows
      .map((row) => row.piece_id)
      .filter((pieceId): pieceId is number => pieceId !== null)

    const stylePieceIds = await getPieceIdsForStyle(
      supabase,
      pieceIds,
      condition.filters.style
    )

    rows = rows.filter((row) => {
      return row.piece_id !== null && stylePieceIds.has(row.piece_id)
    })
  }

  return {
    isEligible: rows.length >= condition.count,
    isCalculable: true,
    current: rows.length,
    required: condition.count,
    label: describeCondition(condition),
  }
}

async function calculateConditionProgress({
  supabase,
  userId,
  condition,
}: {
  supabase: SupabaseServerClient
  userId: string
  condition: BadgeCondition
}): Promise<BadgeProgressSummary> {
  if (condition.type === "know_all_tunes_in_list") {
    return calculateKnowAllTunesInListProgress({
      supabase,
      userId,
      listId: condition.list_id,
    })
  }

  if (condition.type === "know_selected_tunes") {
    return calculateKnowSelectedTunesProgress({
      supabase,
      userId,
      pieceIds: condition.piece_ids,
    })
  }

  if (condition.type === "known_tune_count") {
    return calculateKnownTuneCountProgress({
      supabase,
      userId,
      condition,
    })
  }

  if (condition.type === "added_media_links") {
    return calculateMediaLinkProgress({
      supabase,
      userId,
      condition,
    })
  }

  if (condition.type === "added_lore_entries") {
    return calculateLoreProgress({
      supabase,
      userId,
      condition,
    })
  }

  if (condition.type === "added_missing_details") {
    return calculateMissingDetailsProgress({
      supabase,
      userId,
      condition,
    })
  }

  return {
    isEligible: false,
    isCalculable: false,
    current: 0,
    required: 1,
    label: "This condition type is not supported yet.",
  }
}

export async function calculateBadgeProgress({
  supabase,
  userId,
  conditionLogic,
}: {
  supabase: SupabaseServerClient
  userId: string
  conditionLogic: BadgeConditionLogic
}): Promise<BadgeProgressSummary> {
  const logic = normaliseBadgeConditionLogic(conditionLogic)
  const conditions = logic.conditions ?? []

  const progressItems = await Promise.all(
    conditions.map((condition) =>
      calculateConditionProgress({
        supabase,
        userId,
        condition,
      })
    )
  )

  return combineProgress(logic, progressItems)
}
import { requireUserContext } from "@/lib/auth/session"
import { getToday } from "@/lib/review"
import type { Piece } from "@/lib/types"

export type PracticeIndexSort = "mostNotes" | "latest" | "alphabetical"

export type PracticeIndexSearchParams = {
  q?: string
  category?: string
  from?: string
  to?: string
  sort?: string
}

export type PracticeIndexFilters = {
  q: string
  categoryId: number | null
  from: string
  to: string
  sort: PracticeIndexSort
}

export type PracticeIndexCategoryOption = {
  id: number
  name: string
}

export type PracticeIndexItemKind =
  | "daily_reflection"
  | "review_note"
  | "tune_note"
  | "general_note"

export type PracticeIndexItem = {
  id: string
  rawNoteId: number | null
  kind: PracticeIndexItemKind
  body: string
  noteDate: string
  createdAt: string
  updatedAt: string | null
  practiceDayId: number
  practiceEventId: number | null
  reviewEventId: number | null
  categoryId: number | null
  categoryName: string | null
  piece: Piece | null
}

export type PracticeIndexCategoryGroup = {
  key: string
  categoryId: number | null
  categoryName: string
  noteCount: number
  tuneCount: number
  latestDate: string
  latestNoteAt: string
  notes: PracticeIndexItem[]
}

export type PracticeIndexData = {
  today: string
  filters: PracticeIndexFilters
  categoryGroups: PracticeIndexCategoryGroup[]
  categories: PracticeIndexCategoryOption[]
  summary: {
    totalNotes: number
    categoryGroups: number
    categorisedNotes: number
    uncategorisedNotes: number
    tunesMentioned: number
    dailyReflections: number
  }
}

type PracticeDayRow = {
  id: number
  practice_date: string
  daily_reflection: string | null
  created_at: string
  updated_at: string | null
}

type PracticeNoteCategoryRow = {
  id: number
  name: string
}

type PracticeNoteRow = {
  id: number
  user_id: string
  practice_day_id: number
  practice_event_id: number | null
  piece_id: number | null
  review_event_id: number | null
  category_id: number | null
  body: string
  created_at: string
  updated_at: string | null
  practice_note_categories:
    | {
        id: number
        name: string
      }
    | {
        id: number
        name: string
      }[]
    | null
  pieces: Piece | Piece[] | null
}

function isValidDateOnly(value: string | undefined): value is string {
  if (!value) return false
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function parsePositiveInteger(value: string | undefined) {
  if (!value) return null

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

function getSingleJoinedRow<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function normaliseSort(value: string | undefined): PracticeIndexSort {
  if (value === "latest" || value === "alphabetical") {
    return value
  }

  return "mostNotes"
}

function buildFilters(
  searchParams?: PracticeIndexSearchParams
): PracticeIndexFilters {
  return {
    q: searchParams?.q?.trim() ?? "",
    categoryId: parsePositiveInteger(searchParams?.category),
    from: isValidDateOnly(searchParams?.from) ? searchParams.from : "",
    to: isValidDateOnly(searchParams?.to) ? searchParams.to : "",
    sort: normaliseSort(searchParams?.sort),
  }
}

function getNoteKind(note: PracticeNoteRow): PracticeIndexItemKind {
  if (note.review_event_id) {
    return "review_note"
  }

  if (note.piece_id) {
    return "tune_note"
  }

  return "general_note"
}

function itemMatchesSearch({
  item,
  query,
}: {
  item: PracticeIndexItem
  query: string
}) {
  if (!query) return true

  const normalisedQuery = query.toLowerCase()

  const searchableText = [
    item.body,
    item.categoryName,
    item.piece?.title,
    item.piece?.key,
    item.piece?.style,
    item.piece?.time_signature,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return searchableText.includes(normalisedQuery)
}

function sortNotesNewest(notes: PracticeIndexItem[]) {
  return [...notes].sort((a, b) => {
    const dateCompare = b.noteDate.localeCompare(a.noteDate)

    if (dateCompare !== 0) {
      return dateCompare
    }

    return b.createdAt.localeCompare(a.createdAt)
  })
}

function buildCategoryGroups({
  notes,
  sort,
}: {
  notes: PracticeIndexItem[]
  sort: PracticeIndexSort
}) {
  const groupsByKey = new Map<string, PracticeIndexCategoryGroup>()

  for (const note of notes) {
    const key = note.categoryId ? String(note.categoryId) : "uncategorised"
    const categoryName = note.categoryName ?? "Uncategorised"

    const existing = groupsByKey.get(key)

    if (!existing) {
      groupsByKey.set(key, {
        key,
        categoryId: note.categoryId,
        categoryName,
        noteCount: 1,
        tuneCount: note.piece ? 1 : 0,
        latestDate: note.noteDate,
        latestNoteAt: note.createdAt,
        notes: [note],
      })
      continue
    }

    existing.noteCount += 1
    existing.notes.push(note)

    const tuneIds = new Set(
      existing.notes
        .map((existingNote) => existingNote.piece?.id)
        .filter((pieceId): pieceId is number => typeof pieceId === "number")
    )

    existing.tuneCount = tuneIds.size

    if (
      note.noteDate > existing.latestDate ||
      (note.noteDate === existing.latestDate &&
        note.createdAt > existing.latestNoteAt)
    ) {
      existing.latestDate = note.noteDate
      existing.latestNoteAt = note.createdAt
    }
  }

  const groups = Array.from(groupsByKey.values()).map((group) => ({
    ...group,
    notes: sortNotesNewest(group.notes),
  }))

  if (sort === "alphabetical") {
    return groups.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  }

  if (sort === "latest") {
    return groups.sort(
      (a, b) =>
        b.latestDate.localeCompare(a.latestDate) ||
        b.latestNoteAt.localeCompare(a.latestNoteAt) ||
        a.categoryName.localeCompare(b.categoryName)
    )
  }

  return groups.sort(
    (a, b) =>
      b.noteCount - a.noteCount ||
      b.latestDate.localeCompare(a.latestDate) ||
      a.categoryName.localeCompare(b.categoryName)
  )
}

function buildSummary(notes: PracticeIndexItem[]) {
  const pieceIds = new Set<number>()

  for (const note of notes) {
    if (note.piece) {
      pieceIds.add(note.piece.id)
    }
  }

  return {
    totalNotes: notes.length,
    categoryGroups: new Set(
      notes.map((note) => note.categoryId ?? "uncategorised")
    ).size,
    categorisedNotes: notes.filter((note) => note.categoryId !== null).length,
    uncategorisedNotes: notes.filter((note) => note.categoryId === null).length,
    tunesMentioned: pieceIds.size,
    dailyReflections: notes.filter((note) => note.kind === "daily_reflection")
      .length,
  }
}

export async function loadPracticeIndexData(
  searchParams?: PracticeIndexSearchParams
): Promise<PracticeIndexData> {
  const { supabase, user } = await requireUserContext()
  const today = getToday()
  const filters = buildFilters(searchParams)

  let practiceDaysQuery = supabase
    .from("practice_days")
    .select("id, practice_date, daily_reflection, created_at, updated_at")
    .eq("user_id", user.id)
    .order("practice_date", { ascending: false })

  if (filters.from) {
    practiceDaysQuery = practiceDaysQuery.gte("practice_date", filters.from)
  }

  if (filters.to) {
    practiceDaysQuery = practiceDaysQuery.lte("practice_date", filters.to)
  }

  const { data: practiceDaysData, error: practiceDaysError } =
    await practiceDaysQuery

  if (practiceDaysError) {
    throw new Error(practiceDaysError.message)
  }

  const practiceDays = (practiceDaysData ?? []) as PracticeDayRow[]
  const practiceDayIds = practiceDays.map((day) => day.id)

  const practiceDaysById = new Map(
    practiceDays.map((day) => [day.id, day] as const)
  )

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("practice_note_categories")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (categoriesError) {
    throw new Error(categoriesError.message)
  }

  const categories = (categoriesData ?? []) as PracticeNoteCategoryRow[]

  const noteRows: PracticeNoteRow[] = []

  if (practiceDayIds.length > 0) {
    let notesQuery = supabase
      .from("practice_notes")
      .select(
        `
          id,
          user_id,
          practice_day_id,
          practice_event_id,
          piece_id,
          review_event_id,
          category_id,
          body,
          created_at,
          updated_at,
          practice_note_categories (
            id,
            name
          ),
          pieces (
            id,
            title,
            key,
            style,
            time_signature,
            reference_url
          )
        `
      )
      .eq("user_id", user.id)
      .in("practice_day_id", practiceDayIds)
      .order("created_at", { ascending: false })

    if (filters.categoryId) {
      notesQuery = notesQuery.eq("category_id", filters.categoryId)
    }

    const { data: notesData, error: notesError } = await notesQuery

    if (notesError) {
      throw new Error(notesError.message)
    }

    noteRows.push(...((notesData ?? []) as PracticeNoteRow[]))
  }

  const noteItems: PracticeIndexItem[] = []

  for (const note of noteRows) {
    const practiceDay = practiceDaysById.get(note.practice_day_id)

    if (!practiceDay) {
      continue
    }

    const category = getSingleJoinedRow(note.practice_note_categories)
    const piece = getSingleJoinedRow(note.pieces)

    noteItems.push({
      id: `note-${note.id}`,
      rawNoteId: note.id,
      kind: getNoteKind(note),
      body: note.body,
      noteDate: practiceDay.practice_date,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      practiceDayId: note.practice_day_id,
      practiceEventId: note.practice_event_id,
      reviewEventId: note.review_event_id,
      categoryId: category?.id ?? null,
      categoryName: category?.name ?? null,
      piece,
    })
  }

  const reflectionItems: PracticeIndexItem[] = practiceDays
    .filter((day) => Boolean(day.daily_reflection?.trim()))
    .map((day) => ({
      id: `reflection-${day.id}`,
      rawNoteId: null,
      kind: "daily_reflection",
      body: day.daily_reflection ?? "",
      noteDate: day.practice_date,
      createdAt: day.updated_at ?? day.created_at,
      updatedAt: day.updated_at,
      practiceDayId: day.id,
      practiceEventId: null,
      reviewEventId: null,
      categoryId: null,
      categoryName: null,
      piece: null,
    }))

  const allItems = [...noteItems, ...reflectionItems]

  const filteredItems = allItems.filter((item) => {
    if (filters.categoryId && item.categoryId !== filters.categoryId) {
      return false
    }

    return itemMatchesSearch({ item, query: filters.q })
  })

  const categoryGroups = buildCategoryGroups({
    notes: filteredItems,
    sort: filters.sort,
  })

  return {
    today,
    filters,
    categoryGroups,
    categories,
    summary: buildSummary(filteredItems),
  }
}
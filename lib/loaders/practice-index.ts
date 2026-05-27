import { notFound } from "next/navigation"
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
  prompt: string | null
}

export type PracticeIndexItemKind =
  | "daily_reflection"
  | "review_note"
  | "tune_note"
  | "general_note"

export type PracticeIndexItemFocus = {
  id: number
  title: string
  description: string | null
  status: string
}

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
  categoryPrompt: string | null
  focus: PracticeIndexItemFocus | null
  piece: Piece | null
}

export type PracticeIndexCategoryGroup = {
  key: string
  categoryId: number | null
  categoryName: string
  categoryPrompt: string | null
  noteCount: number
  tuneCount: number
  latestDate: string
  latestNoteAt: string
  notes: PracticeIndexItem[]
}

export type PracticeIndexFocusStatus =
  | "active"
  | "paused"
  | "completed"
  | "archived"

export type PracticeIndexFocusNote = {
  id: number
  body: string
  noteDate: string | null
  createdAt: string
  piece: Piece | null
  categoryName: string | null
}

export type PracticeIndexFocusSummary = {
  id: number
  title: string
  description: string | null
  status: PracticeIndexFocusStatus
  targetDate: string | null
  tuneCount: number
  tuneTitles: string[]
  noteCount: number
  lastTouchedDate: string | null
  lastTouchedAt: string | null
  recentNotes: PracticeIndexFocusNote[]
}

export type PracticeIndexData = {
  today: string
  filters: PracticeIndexFilters
  focusSummaries: PracticeIndexFocusSummary[]
  categoryGroups: PracticeIndexCategoryGroup[]
  categories: PracticeIndexCategoryOption[]
  summary: {
    totalNotes: number
    categoryGroups: number
    categorisedNotes: number
    uncategorisedNotes: number
    tunesMentioned: number
    dailyReflections: number
    activeFoci: number
  }
}

export type PracticeCategoryDetailNote = {
  id: number
  body: string
  noteDate: string
  createdAt: string
  updatedAt: string | null
  practiceDayId: number
  practiceEventId: number | null
  reviewEventId: number | null
  piece: Piece | null
}

export type PracticeCategoryTuneSummary = {
  piece: Piece
  noteCount: number
  latestDate: string
  latestNoteAt: string
  latestSnippet: string | null
}

export type PracticeCategoryDetailData = {
  today: string
  category: {
    id: number
    name: string
    prompt: string | null
  }
  summary: {
    totalNotes: number
    tunesMentioned: number
    latestDate: string | null
  }
  tuneSummaries: PracticeCategoryTuneSummary[]
  notes: PracticeCategoryDetailNote[]
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
  prompt: string | null
}

type PracticeCategoryDetailRow = {
  id: number
  name: string
  prompt: string | null
}

type PracticeNoteFocusRow = {
  id: number
  title: string
  description: string | null
  status: string
}

type PracticeNoteRow = {
  id: number
  user_id: string
  practice_day_id: number
  practice_event_id: number | null
  piece_id: number | null
  review_event_id: number | null
  category_id: number | null
  focus_id: number | null
  body: string
  created_at: string
  updated_at: string | null
  practice_note_categories:
    | {
        id: number
        name: string
        prompt: string | null
      }
    | {
        id: number
        name: string
        prompt: string | null
      }[]
    | null
  pieces: Piece | Piece[] | null
}

type PracticeCategoryDetailNoteRow = {
  id: number
  user_id: string
  practice_day_id: number
  practice_event_id: number | null
  piece_id: number | null
  review_event_id: number | null
  category_id: number | null
  body: string | null
  created_at: string
  updated_at: string | null
  practice_days:
    | {
        practice_date: string | null
      }
    | {
        practice_date: string | null
      }[]
    | null
  pieces: Piece | Piece[] | null
}

type PracticeFocusRow = {
  id: number
  title: string
  description: string | null
  status: PracticeIndexFocusStatus
  target_date: string | null
  created_at: string
  updated_at: string | null
}

type PracticeFocusTuneRow = {
  focus_id: number
  piece_id: number
  pieces:
    | {
        title: string | null
      }
    | {
        title: string | null
      }[]
    | null
}

type PracticeFocusNoteRow = {
  id: number
  focus_id: number
  body: string | null
  created_at: string
  piece_id: number | null
  practice_days:
    | {
        practice_date: string | null
      }
    | {
        practice_date: string | null
      }[]
    | null
  practice_note_categories:
    | {
        name: string | null
      }
    | {
        name: string | null
      }[]
    | null
  pieces: Piece | Piece[] | null
}

type PracticeIndexFocusNoteWithFocusId = PracticeIndexFocusNote & {
  focusId: number
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
    item.categoryPrompt,
    item.focus?.title,
    item.focus?.description,
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
    const categoryPrompt = note.categoryPrompt ?? null

    const existing = groupsByKey.get(key)

    if (!existing) {
      groupsByKey.set(key, {
        key,
        categoryId: note.categoryId,
        categoryName,
        categoryPrompt,
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

    if (!existing.categoryPrompt && categoryPrompt) {
      existing.categoryPrompt = categoryPrompt
    }

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

function mapFocusNote(row: PracticeFocusNoteRow): PracticeIndexFocusNote | null {
  const body = row.body?.trim()

  if (!body) {
    return null
  }

  return {
    id: row.id,
    body,
    noteDate: getSingleJoinedRow(row.practice_days)?.practice_date ?? null,
    createdAt: row.created_at,
    piece: getSingleJoinedRow(row.pieces),
    categoryName: getSingleJoinedRow(row.practice_note_categories)?.name ?? null,
  }
}

function getFocusStatusRank(status: PracticeIndexFocusStatus) {
  if (status === "active") return 0
  if (status === "paused") return 1
  if (status === "completed") return 2
  return 3
}

function buildFocusSummaries({
  foci,
  focusTunes,
  focusNotes,
}: {
  foci: PracticeFocusRow[]
  focusTunes: PracticeFocusTuneRow[]
  focusNotes: PracticeIndexFocusNoteWithFocusId[]
}) {
  const tuneIdsByFocusId = new Map<number, Set<number>>()
  const tuneTitlesByFocusId = new Map<number, Set<string>>()
  const notesByFocusId = new Map<number, PracticeIndexFocusNote[]>()

  for (const focusTune of focusTunes) {
    const tuneIds = tuneIdsByFocusId.get(focusTune.focus_id) ?? new Set()
    tuneIds.add(focusTune.piece_id)
    tuneIdsByFocusId.set(focusTune.focus_id, tuneIds)

    const title = getSingleJoinedRow(focusTune.pieces)?.title?.trim()

    if (title) {
      const titles = tuneTitlesByFocusId.get(focusTune.focus_id) ?? new Set()
      titles.add(title)
      tuneTitlesByFocusId.set(focusTune.focus_id, titles)
    }
  }

  for (const note of focusNotes) {
    const existing = notesByFocusId.get(note.focusId) ?? []
    existing.push(note)
    notesByFocusId.set(note.focusId, existing)
  }

  return foci
    .map((focus) => {
      const notes = (notesByFocusId.get(focus.id) ?? []).sort((a, b) => {
        const dateCompare = (b.noteDate ?? "").localeCompare(a.noteDate ?? "")

        if (dateCompare !== 0) {
          return dateCompare
        }

        return b.createdAt.localeCompare(a.createdAt)
      })

      const latestNote = notes[0] ?? null
      const tuneTitles = Array.from(
        tuneTitlesByFocusId.get(focus.id) ?? []
      ).sort((a, b) => a.localeCompare(b))

      return {
        id: focus.id,
        title: focus.title,
        description: focus.description,
        status: focus.status,
        targetDate: focus.target_date,
        tuneCount: tuneIdsByFocusId.get(focus.id)?.size ?? 0,
        tuneTitles,
        noteCount: notes.length,
        lastTouchedDate: latestNote?.noteDate ?? null,
        lastTouchedAt: latestNote?.createdAt ?? null,
        recentNotes: notes.slice(0, 2),
      }
    })
    .sort(
      (a, b) =>
        getFocusStatusRank(a.status) - getFocusStatusRank(b.status) ||
        (b.lastTouchedDate ?? "").localeCompare(a.lastTouchedDate ?? "") ||
        (b.lastTouchedAt ?? "").localeCompare(a.lastTouchedAt ?? "") ||
        a.title.localeCompare(b.title)
    )
}

function buildSummary({
  notes,
  focusSummaries,
}: {
  notes: PracticeIndexItem[]
  focusSummaries: PracticeIndexFocusSummary[]
}) {
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
    activeFoci: focusSummaries.filter((focus) => focus.status === "active")
      .length,
  }
}

function mapCategoryDetailNote(
  row: PracticeCategoryDetailNoteRow
): PracticeCategoryDetailNote | null {
  const body = row.body?.trim()
  const practiceDate = getSingleJoinedRow(row.practice_days)?.practice_date

  if (!body || !practiceDate) {
    return null
  }

  return {
    id: row.id,
    body,
    noteDate: practiceDate,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    practiceDayId: row.practice_day_id,
    practiceEventId: row.practice_event_id,
    reviewEventId: row.review_event_id,
    piece: getSingleJoinedRow(row.pieces),
  }
}

function buildCategoryTuneSummaries(notes: PracticeCategoryDetailNote[]) {
  const summariesByPieceId = new Map<number, PracticeCategoryTuneSummary>()

  for (const note of notes) {
    if (!note.piece) continue

    const existing = summariesByPieceId.get(note.piece.id)

    if (!existing) {
      summariesByPieceId.set(note.piece.id, {
        piece: note.piece,
        noteCount: 1,
        latestDate: note.noteDate,
        latestNoteAt: note.createdAt,
        latestSnippet: note.body,
      })
      continue
    }

    existing.noteCount += 1

    if (
      note.noteDate > existing.latestDate ||
      (note.noteDate === existing.latestDate &&
        note.createdAt > existing.latestNoteAt)
    ) {
      existing.latestDate = note.noteDate
      existing.latestNoteAt = note.createdAt
      existing.latestSnippet = note.body
    }
  }

  return Array.from(summariesByPieceId.values()).sort(
    (a, b) =>
      b.noteCount - a.noteCount ||
      b.latestDate.localeCompare(a.latestDate) ||
      a.piece.title.localeCompare(b.piece.title)
  )
}

async function loadPracticeFocusSummaries({
  supabase,
  userId,
}: {
  supabase: Awaited<
    ReturnType<typeof import("@/lib/supabase/server").createClient>
  >
  userId: string
}) {
  const { data: focusData, error: focusError } = await supabase
    .from("practice_foci")
    .select(
      `
        id,
        title,
        description,
        status,
        target_date,
        created_at,
        updated_at
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (focusError) {
    throw new Error(focusError.message)
  }

  const foci = (focusData ?? []) as unknown as PracticeFocusRow[]

  if (foci.length === 0) {
    return []
  }

  const focusIds = foci.map((focus) => focus.id)

  const { data: focusTuneData, error: focusTuneError } = await supabase
    .from("practice_focus_tunes")
    .select(
      `
        focus_id,
        piece_id,
        pieces (
          title
        )
      `
    )
    .in("focus_id", focusIds)

  if (focusTuneError) {
    throw new Error(focusTuneError.message)
  }

  const { data: focusNoteData, error: focusNoteError } = await supabase
    .from("practice_notes")
    .select(
      `
        id,
        focus_id,
        body,
        created_at,
        piece_id,
        practice_days (
          practice_date
        ),
        practice_note_categories (
          name
        ),
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          composer,
          reference_url
        )
      `
    )
    .eq("user_id", userId)
    .in("focus_id", focusIds)
    .not("focus_id", "is", null)
    .order("created_at", { ascending: false })

  if (focusNoteError) {
    throw new Error(focusNoteError.message)
  }

  const focusNotes = ((focusNoteData ?? []) as unknown as PracticeFocusNoteRow[])
    .map((row) => {
      const mappedNote = mapFocusNote(row)

      if (!mappedNote) {
        return null
      }

      return {
        ...mappedNote,
        focusId: row.focus_id,
      }
    })
    .filter(
      (note): note is PracticeIndexFocusNoteWithFocusId => note !== null
    )

  return buildFocusSummaries({
    foci,
    focusTunes: (focusTuneData ?? []) as unknown as PracticeFocusTuneRow[],
    focusNotes,
  })
}

export async function loadPracticeIndexData(
  searchParams?: PracticeIndexSearchParams
): Promise<PracticeIndexData> {
  const { supabase, user } = await requireUserContext()
  const today = getToday()
  const filters = buildFilters(searchParams)

  const focusSummaries = await loadPracticeFocusSummaries({
    supabase,
    userId: user.id,
  })

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
    .select("id, name, prompt")
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
          focus_id,
          body,
          created_at,
          updated_at,
          practice_note_categories (
            id,
            name,
            prompt
          ),
          pieces (
            id,
            title,
            key,
            style,
            time_signature,
            composer,
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

    noteRows.push(...((notesData ?? []) as unknown as PracticeNoteRow[]))
  }

  const focusIds = Array.from(
    new Set(
      noteRows
        .map((note) => note.focus_id)
        .filter((focusId): focusId is number => typeof focusId === "number")
    )
  )

  let fociById = new Map<number, PracticeNoteFocusRow>()

  if (focusIds.length > 0) {
    const { data: focusRows, error: focusRowsError } = await supabase
      .from("practice_foci")
      .select("id, title, description, status")
      .eq("user_id", user.id)
      .in("id", focusIds)

    if (focusRowsError) {
      throw new Error(focusRowsError.message)
    }

    fociById = new Map(
      ((focusRows ?? []) as PracticeNoteFocusRow[]).map((focus) => [
        focus.id,
        focus,
      ])
    )
  }

  const noteItems: PracticeIndexItem[] = []

  for (const note of noteRows) {
    const practiceDay = practiceDaysById.get(note.practice_day_id)

    if (!practiceDay) {
      continue
    }

    const category = getSingleJoinedRow(note.practice_note_categories)
    const focus = note.focus_id ? fociById.get(note.focus_id) ?? null : null
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
      categoryPrompt: category?.prompt ?? null,
      focus: focus
        ? {
            id: focus.id,
            title: focus.title,
            description: focus.description,
            status: focus.status,
          }
        : null,
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
      categoryPrompt: null,
      focus: null,
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
    focusSummaries,
    categoryGroups,
    categories,
    summary: buildSummary({
      notes: filteredItems,
      focusSummaries,
    }),
  }
}

export async function loadPracticeCategoryDetailData(
  categoryId: number
): Promise<PracticeCategoryDetailData> {
  const { supabase, user } = await requireUserContext()
  const today = getToday()

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound()
  }

  const { data: categoryData, error: categoryError } = await supabase
    .from("practice_note_categories")
    .select("id, name, prompt")
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (categoryError) {
    throw new Error(categoryError.message)
  }

  if (!categoryData) {
    notFound()
  }

  const category = categoryData as unknown as PracticeCategoryDetailRow

  const { data: notesData, error: notesError } = await supabase
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
        practice_days (
          practice_date
        ),
        pieces (
          id,
          title,
          key,
          style,
          time_signature,
          composer,
          reference_url
        )
      `
    )
    .eq("user_id", user.id)
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })

  if (notesError) {
    throw new Error(notesError.message)
  }

  const notes = ((notesData ?? []) as unknown as PracticeCategoryDetailNoteRow[])
    .map(mapCategoryDetailNote)
    .filter((note): note is PracticeCategoryDetailNote => note !== null)
    .sort((a, b) => {
      const dateCompare = b.noteDate.localeCompare(a.noteDate)

      if (dateCompare !== 0) {
        return dateCompare
      }

      return b.createdAt.localeCompare(a.createdAt)
    })

  const tuneSummaries = buildCategoryTuneSummaries(notes)

  return {
    today,
    category: {
      id: category.id,
      name: category.name,
      prompt: category.prompt,
    },
    summary: {
      totalNotes: notes.length,
      tunesMentioned: tuneSummaries.length,
      latestDate: notes[0]?.noteDate ?? null,
    },
    tuneSummaries,
    notes,
  }
}

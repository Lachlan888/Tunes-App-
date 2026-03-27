"use server"

import { createClient } from "@/lib/supabase/server"
import { parse } from "csv-parse/sync"
import { redirect } from "next/navigation"

function appendQueryParam(url: string, key: string, value: string) {
  return url.includes("?")
    ? `${url}&${key}=${encodeURIComponent(value)}`
    : `${url}?${key}=${encodeURIComponent(value)}`
}

const REQUIRED_HEADERS = [
  "title",
  "key",
  "style",
  "time_signature",
  "reference_url",
]

const UPLOADED_TUNES_LIST_NAME = "Uploaded Tunes"

type ParsedCsvRow = {
  title: string
  key: string | null
  style: string | null
  time_signature: string | null
  reference_url: string | null
}

type ExistingPiece = {
  id: number
  title: string
  key: string | null
}

function normaliseForDuplicateMatch(value: string | null) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "")
    .trim()
}

function buildPieceMatchKey(title: string, key: string | null) {
  return `${normaliseForDuplicateMatch(title)}|||${normaliseForDuplicateMatch(
    key
  )}`
}

function normaliseOptionalValue(value: string | null | undefined) {
  const trimmed = String(value ?? "").trim()
  return trimmed === "" ? null : trimmed
}

export async function uploadKnownTunesCsv(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const file = formData.get("csv_file")
  const redirectTo = String(formData.get("redirect_to") ?? "/library")

  if (!(file instanceof File)) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "missing_file"))
  }

  if (file.size === 0) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "empty_file"))
  }

  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()

  const looksLikeCsv =
    fileName.endsWith(".csv") ||
    fileType === "text/csv" ||
    fileType === "application/csv" ||
    fileType === "text/plain"

  if (!looksLikeCsv) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "invalid_type"))
  }

  const fileText = await file.text()

  let records: string[][]

  try {
    records = parse(fileText, {
      bom: true,
      skip_empty_lines: true,
      relax_column_count: false,
      trim: true,
    }) as string[][]
  } catch {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "invalid_csv"))
  }

  if (records.length === 0) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "empty_file"))
  }

  const headerValues = records[0].map((value) => String(value).trim())
  const headersMatch =
    headerValues.length === REQUIRED_HEADERS.length &&
    REQUIRED_HEADERS.every((header, index) => headerValues[index] === header)

  if (!headersMatch) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "invalid_headers"))
  }

  const dataRows = records.slice(1)

  if (dataRows.length === 0) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "empty_rows"))
  }

  const parsedRows: ParsedCsvRow[] = []

  for (let index = 0; index < dataRows.length; index += 1) {
    const values = dataRows[index]
    const rowNumber = index + 2

    if (values.length !== REQUIRED_HEADERS.length) {
      redirect(
        appendQueryParam(
          appendQueryParam(redirectTo, "bulk_upload", "invalid_row_shape"),
          "row",
          String(rowNumber)
        )
      )
    }

    const title = String(values[0] ?? "").trim()

    if (!title) {
      redirect(
        appendQueryParam(
          appendQueryParam(redirectTo, "bulk_upload", "missing_title_row"),
          "row",
          String(rowNumber)
        )
      )
    }

    parsedRows.push({
      title,
      key: normaliseOptionalValue(values[1]),
      style: normaliseOptionalValue(values[2]),
      time_signature: normaliseOptionalValue(values[3]),
      reference_url: normaliseOptionalValue(values[4]),
    })
  }

  const uniqueRowsByPieceKey = new Map<string, ParsedCsvRow>()

  for (const row of parsedRows) {
    const pieceKey = buildPieceMatchKey(row.title, row.key)

    if (!uniqueRowsByPieceKey.has(pieceKey)) {
      uniqueRowsByPieceKey.set(pieceKey, row)
    }
  }

  const uniqueRows = Array.from(uniqueRowsByPieceKey.values())

  const { data: existingPieces, error: existingPiecesError } = await supabase
    .from("pieces")
    .select("id, title, key")
    .order("id")

  if (existingPiecesError) {
    throw new Error(existingPiecesError.message)
  }

  const existingPieceMap = new Map<string, ExistingPiece>()

  for (const piece of (existingPieces ?? []) as ExistingPiece[]) {
    existingPieceMap.set(buildPieceMatchKey(piece.title, piece.key), piece)
  }

  const rowsToCreate = uniqueRows.filter((row) => {
    const pieceKey = buildPieceMatchKey(row.title, row.key)
    return !existingPieceMap.has(pieceKey)
  })

  let createdPiecesCount = 0

  if (rowsToCreate.length > 0) {
    const { data: insertedPieces, error: insertPiecesError } = await supabase
      .from("pieces")
      .insert(
        rowsToCreate.map((row) => ({
          title: row.title,
          key: row.key,
          style: row.style,
          time_signature: row.time_signature,
          reference_url: row.reference_url,
        }))
      )
      .select("id, title, key")

    if (insertPiecesError) {
      throw new Error(insertPiecesError.message)
    }

    createdPiecesCount = insertedPieces?.length ?? 0

    for (const piece of (insertedPieces ?? []) as ExistingPiece[]) {
      existingPieceMap.set(buildPieceMatchKey(piece.title, piece.key), piece)
    }
  }

  const pieceIds = uniqueRows
    .map((row) => {
      const pieceKey = buildPieceMatchKey(row.title, row.key)
      return existingPieceMap.get(pieceKey)?.id ?? null
    })
    .filter((id): id is number => id !== null)

  if (pieceIds.length === 0) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "nothing_to_import"))
  }

  const { data: existingUploadedTunesLists, error: existingListError } =
    await supabase
      .from("learning_lists")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", UPLOADED_TUNES_LIST_NAME)
      .order("id", { ascending: true })
      .limit(1)

  if (existingListError) {
    throw new Error(existingListError.message)
  }

  let uploadedTunesListId = existingUploadedTunesLists?.[0]?.id ?? null

  if (!uploadedTunesListId) {
    const { data: insertedList, error: insertListError } = await supabase
      .from("learning_lists")
      .insert({
        user_id: user.id,
        name: UPLOADED_TUNES_LIST_NAME,
        description: "Created automatically from bulk tune upload",
        is_imported: true,
      })
      .select("id")
      .single()

    if (insertListError) {
      throw new Error(insertListError.message)
    }

    uploadedTunesListId = insertedList.id
  }

  const { data: existingKnownPieces, error: existingKnownPiecesError } =
    await supabase
      .from("user_known_pieces")
      .select("piece_id")
      .eq("user_id", user.id)
      .in("piece_id", pieceIds)

  if (existingKnownPiecesError) {
    throw new Error(existingKnownPiecesError.message)
  }

  const existingKnownPieceIds = new Set(
    (existingKnownPieces ?? []).map((row) => row.piece_id)
  )

  const knownPieceIdsToInsert = pieceIds.filter(
    (pieceId) => !existingKnownPieceIds.has(pieceId)
  )

  let addedKnownCount = 0

  if (knownPieceIdsToInsert.length > 0) {
    const { error: insertKnownPiecesError } = await supabase
      .from("user_known_pieces")
      .insert(
        knownPieceIdsToInsert.map((piece_id) => ({
          user_id: user.id,
          piece_id,
        }))
      )

    if (insertKnownPiecesError) {
      throw new Error(insertKnownPiecesError.message)
    }

    addedKnownCount = knownPieceIdsToInsert.length
  }

  const { data: existingListItems, error: existingListItemsError } =
    await supabase
      .from("learning_list_items")
      .select("piece_id, position")
      .eq("learning_list_id", uploadedTunesListId)

  if (existingListItemsError) {
    throw new Error(existingListItemsError.message)
  }

  const existingListItemPieceIds = new Set(
    (existingListItems ?? []).map((row) => row.piece_id)
  )

  const highestExistingPosition = (existingListItems ?? []).reduce(
    (highest, item) =>
      item.position != null && item.position > highest ? item.position : highest,
    0
  )

  const pieceIdsToAddToList = pieceIds.filter(
    (pieceId) => !existingListItemPieceIds.has(pieceId)
  )

  let addedToListCount = 0

  if (pieceIdsToAddToList.length > 0) {
    const { error: insertListItemsError } = await supabase
      .from("learning_list_items")
      .insert(
        pieceIdsToAddToList.map((piece_id, index) => ({
          learning_list_id: uploadedTunesListId,
          piece_id,
          position: highestExistingPosition + index + 1,
        }))
      )

    if (insertListItemsError) {
      throw new Error(insertListItemsError.message)
    }

    addedToListCount = pieceIdsToAddToList.length
  }

  const reusedPiecesCount = uniqueRows.length - createdPiecesCount
  const alreadyKnownCount = pieceIds.length - addedKnownCount
  const alreadyInListCount = pieceIds.length - addedToListCount

  let nextUrl = appendQueryParam(redirectTo, "bulk_upload", "imported")
  nextUrl = appendQueryParam(
    nextUrl,
    "created_pieces",
    String(createdPiecesCount)
  )
  nextUrl = appendQueryParam(
    nextUrl,
    "reused_pieces",
    String(reusedPiecesCount)
  )
  nextUrl = appendQueryParam(nextUrl, "added_known", String(addedKnownCount))
  nextUrl = appendQueryParam(
    nextUrl,
    "already_known",
    String(alreadyKnownCount)
  )
  nextUrl = appendQueryParam(nextUrl, "added_to_list", String(addedToListCount))
  nextUrl = appendQueryParam(
    nextUrl,
    "already_in_list",
    String(alreadyInListCount)
  )

  redirect(nextUrl)
}
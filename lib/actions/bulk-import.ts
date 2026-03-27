"use server"

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

export async function uploadKnownTunesCsv(formData: FormData) {
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
  const normalisedText = fileText.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const rows = normalisedText
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row !== "")

  if (rows.length === 0) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "empty_file"))
  }

  const headerRow = rows[0]
  const headerValues = headerRow.split(",").map((value) => value.trim())
  const headersMatch =
    headerValues.length === REQUIRED_HEADERS.length &&
    REQUIRED_HEADERS.every((header, index) => headerValues[index] === header)

  if (!headersMatch) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "invalid_headers"))
  }

  const dataRows = rows.slice(1)

  if (dataRows.length === 0) {
    redirect(appendQueryParam(redirectTo, "bulk_upload", "empty_rows"))
  }

  for (let index = 0; index < dataRows.length; index += 1) {
    const row = dataRows[index]
    const values = row.split(",").map((value) => value.trim())
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

    const title = values[0]

    if (!title) {
      redirect(
        appendQueryParam(
          appendQueryParam(redirectTo, "bulk_upload", "missing_title_row"),
          "row",
          String(rowNumber)
        )
      )
    }
  }

  redirect(appendQueryParam(redirectTo, "bulk_upload", "validated"))
}
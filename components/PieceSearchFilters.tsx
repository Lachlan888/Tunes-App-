"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { FormEvent } from "react"

type PieceSearchFiltersProps = {
  basePath: string
  searchLabel: string
  searchPlaceholder: string
  searchValue: string

  selectedKeys?: string[]
  selectedStyles?: string[]
  selectedTimeSignatures?: string[]

  selectedKey?: string
  selectedStyle?: string
  selectedTimeSignature?: string

  availableKeys: string[]
  availableStyles: string[]
  availableTimeSignatures: string[]
  hasActiveFilters: boolean
  preservedParams?: Record<string, string>
}

function toSafeArray(value: string[] | string | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

export default function PieceSearchFilters({
  basePath,
  searchLabel,
  searchPlaceholder,
  searchValue,

  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,

  selectedKey,
  selectedStyle,
  selectedTimeSignature,

  availableKeys,
  availableStyles,
  availableTimeSignatures,
  hasActiveFilters,
  preservedParams = {},
}: PieceSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const safeSelectedKeys =
    selectedKeys && selectedKeys.length > 0
      ? selectedKeys
      : toSafeArray(selectedKey)

  const safeSelectedStyles =
    selectedStyles && selectedStyles.length > 0
      ? selectedStyles
      : toSafeArray(selectedStyle)

  const safeSelectedTimeSignatures =
    selectedTimeSignatures && selectedTimeSignatures.length > 0
      ? selectedTimeSignatures
      : toSafeArray(selectedTimeSignature)

  function buildParamsFromCurrentSearch() {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(preservedParams)) {
      if (value) {
        params.set(key, value)
      }
    }

    const currentQuery = searchParams.get("q")
    if (currentQuery) {
      params.set("q", currentQuery)
    }

    for (const key of searchParams.getAll("key")) {
      if (key) params.append("key", key)
    }

    for (const style of searchParams.getAll("style")) {
      if (style) params.append("style", style)
    }

    for (const timeSignature of searchParams.getAll("time_signature")) {
      if (timeSignature) params.append("time_signature", timeSignature)
    }

    return params
  }

  function buildClearFiltersHref() {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(preservedParams)) {
      if (value) {
        params.set(key, value)
      }
    }

    return params.toString() ? `${basePath}?${params.toString()}` : basePath
  }

  function handleMultiCheckboxChange(
    groupName: "key" | "style" | "time_signature",
    value: string,
    checked: boolean
  ) {
    const params = buildParamsFromCurrentSearch()

    const existingValues = params.getAll(groupName).filter(Boolean)
    params.delete(groupName)

    const nextValues = checked
      ? Array.from(new Set([...existingValues, value]))
      : existingValues.filter((existingValue) => existingValue !== value)

    for (const nextValue of nextValues) {
      params.append(groupName, nextValue)
    }

    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath)
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(preservedParams)) {
      if (value) {
        params.set(key, value)
      }
    }

    const q = String(formData.get("q") ?? "").trim()
    if (q) {
      params.set("q", q)
    }

    for (const key of formData.getAll("key")) {
      const value = String(key).trim()
      if (value) params.append("key", value)
    }

    for (const style of formData.getAll("style")) {
      const value = String(style).trim()
      if (value) params.append("style", value)
    }

    for (const timeSignature of formData.getAll("time_signature")) {
      const value = String(timeSignature).trim()
      if (value) params.append("time_signature", value)
    }

    router.push(params.toString() ? `${basePath}?${params.toString()}` : basePath)
  }

  const clearFiltersHref = buildClearFiltersHref()

  return (
    <form onSubmit={handleSearchSubmit} className="mb-6">
      {Object.entries(preservedParams).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      <label htmlFor="q" className="mb-2 block text-sm font-medium">
        {searchLabel}
      </label>
      <input
        id="q"
        name="q"
        defaultValue={searchValue}
        placeholder={searchPlaceholder}
        className="mb-4 w-full border p-2"
      />

      <fieldset className="mb-4 border p-3">
        <legend className="px-1 font-medium">Filter by key</legend>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {availableKeys.map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="key"
                value={key}
                checked={safeSelectedKeys.includes(key)}
                onChange={(event) =>
                  handleMultiCheckboxChange("key", key, event.target.checked)
                }
              />
              <span>{key}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-4 border p-3">
        <legend className="px-1 font-medium">Filter by style</legend>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {availableStyles.map((style) => (
            <label key={style} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="style"
                value={style}
                checked={safeSelectedStyles.includes(style)}
                onChange={(event) =>
                  handleMultiCheckboxChange("style", style, event.target.checked)
                }
              />
              <span>{style}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mb-4 border p-3">
        <legend className="px-1 font-medium">Filter by time signature</legend>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {availableTimeSignatures.map((timeSignature) => (
            <label key={timeSignature} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="time_signature"
                value={timeSignature}
                checked={safeSelectedTimeSignatures.includes(timeSignature)}
                onChange={(event) =>
                  handleMultiCheckboxChange(
                    "time_signature",
                    timeSignature,
                    event.target.checked
                  )
                }
              />
              <span>{timeSignature}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button className="bg-black px-4 py-2 text-white">Search</button>

        {hasActiveFilters && (
          <Link href={clearFiltersHref} className="text-sm underline">
            Clear filters
          </Link>
        )}
      </div>
    </form>
  )
}
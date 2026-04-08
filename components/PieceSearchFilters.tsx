"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react"

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

function formatFilterLabel(group: "key" | "style" | "time_signature") {
  if (group === "key") return "Key"
  if (group === "style") return "Style"
  return "Time signature"
}

function buildChipId(group: "key" | "style" | "time_signature", value: string) {
  return `${group}:${value}`
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
  const [isPending, startTransition] = useTransition()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [query, setQuery] = useState(searchValue)
  const panelRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    setQuery(searchValue)
  }, [searchValue])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!isPanelOpen) return
      if (!panelRef.current) return

      if (!panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPanelOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isPanelOpen])

  function navigateWithParams(params: URLSearchParams) {
    const href = params.toString() ? `${basePath}?${params.toString()}` : basePath

    startTransition(() => {
      router.push(href)
    })
  }

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

    navigateWithParams(params)
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(preservedParams)) {
      if (value) {
        params.set(key, value)
      }
    }

    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      params.set("q", trimmedQuery)
    }

    for (const key of safeSelectedKeys) {
      params.append("key", key)
    }

    for (const style of safeSelectedStyles) {
      params.append("style", style)
    }

    for (const timeSignature of safeSelectedTimeSignatures) {
      params.append("time_signature", timeSignature)
    }

    navigateWithParams(params)
  }

  function handleRemoveSingleFilter(
    groupName: "key" | "style" | "time_signature",
    value: string
  ) {
    const params = buildParamsFromCurrentSearch()
    const existingValues = params.getAll(groupName).filter(Boolean)

    params.delete(groupName)

    for (const existingValue of existingValues) {
      if (existingValue !== value) {
        params.append(groupName, existingValue)
      }
    }

    navigateWithParams(params)
  }

  function handleClearAll() {
    const params = new URLSearchParams()

    for (const [key, value] of Object.entries(preservedParams)) {
      if (value) {
        params.set(key, value)
      }
    }

    navigateWithParams(params)
    setIsPanelOpen(false)
  }

  const clearFiltersHref = buildClearFiltersHref()

  const activeFilterCount =
    safeSelectedKeys.length +
    safeSelectedStyles.length +
    safeSelectedTimeSignatures.length

  const activeChips = useMemo(
    () => [
      ...safeSelectedKeys.map((value) => ({
        id: buildChipId("key", value),
        group: "key" as const,
        groupLabel: formatFilterLabel("key"),
        value,
      })),
      ...safeSelectedStyles.map((value) => ({
        id: buildChipId("style", value),
        group: "style" as const,
        groupLabel: formatFilterLabel("style"),
        value,
      })),
      ...safeSelectedTimeSignatures.map((value) => ({
        id: buildChipId("time_signature", value),
        group: "time_signature" as const,
        groupLabel: formatFilterLabel("time_signature"),
        value,
      })),
    ],
    [safeSelectedKeys, safeSelectedStyles, safeSelectedTimeSignatures]
  )

  return (
    <div
      ref={panelRef}
      className={`relative mb-6 transition-opacity ${
        isPending ? "opacity-80" : "opacity-100"
      }`}
    >
      <form onSubmit={handleSearchSubmit} className="rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="q" className="mb-2 block text-sm font-medium">
              {searchLabel}
            </label>
            <input
              id="q"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border px-3 py-2"
              aria-busy={isPending}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
              disabled={isPending}
            >
              {isPending ? "Searching..." : "Search"}
            </button>

            <button
              type="button"
              onClick={() => setIsPanelOpen((current) => !current)}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-60"
              disabled={isPending}
              aria-expanded={isPanelOpen}
              aria-controls="piece-filter-panel"
            >
              {isPending
                ? "Updating..."
                : activeFilterCount > 0
                ? `Filters (${activeFilterCount})`
                : "Filters"}
            </button>

            {hasActiveFilters && (
              <Link href={clearFiltersHref} className="text-sm underline">
                Clear filters
              </Link>
            )}
          </div>
        </div>

        {isPending && (
          <p className="mt-3 text-sm text-gray-600">Updating filters...</p>
        )}

        {activeChips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleRemoveSingleFilter(chip.group, chip.value)}
                className="rounded-full border px-3 py-1 text-sm"
                disabled={isPending}
              >
                {chip.groupLabel}: {chip.value} ×
              </button>
            ))}
          </div>
        )}
      </form>

      {isPanelOpen && (
        <div
          id="piece-filter-panel"
          className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border bg-white p-4 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Filter tunes</h3>
              <p className="text-sm text-gray-600">
                Select as many filters as you like.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="rounded-lg border px-3 py-2 text-sm"
                  disabled={isPending}
                >
                  Clear all
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPanelOpen(false)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <fieldset className="min-w-0 rounded-xl border p-3" disabled={isPending}>
              <legend className="px-1 text-sm font-medium">
                Key ({safeSelectedKeys.length})
              </legend>
              <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                {availableKeys.length === 0 ? (
                  <p className="text-sm text-gray-500">No keys available.</p>
                ) : (
                  availableKeys.map((key) => (
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
                  ))
                )}
              </div>
            </fieldset>

            <fieldset className="min-w-0 rounded-xl border p-3" disabled={isPending}>
              <legend className="px-1 text-sm font-medium">
                Style ({safeSelectedStyles.length})
              </legend>
              <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                {availableStyles.length === 0 ? (
                  <p className="text-sm text-gray-500">No styles available.</p>
                ) : (
                  availableStyles.map((style) => (
                    <label key={style} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="style"
                        value={style}
                        checked={safeSelectedStyles.includes(style)}
                        onChange={(event) =>
                          handleMultiCheckboxChange(
                            "style",
                            style,
                            event.target.checked
                          )
                        }
                      />
                      <span>{style}</span>
                    </label>
                  ))
                )}
              </div>
            </fieldset>

            <fieldset className="min-w-0 rounded-xl border p-3" disabled={isPending}>
              <legend className="px-1 text-sm font-medium">
                Time signature ({safeSelectedTimeSignatures.length})
              </legend>
              <div className="mt-2 max-h-64 space-y-2 overflow-y-auto pr-1">
                {availableTimeSignatures.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No time signatures available.
                  </p>
                ) : (
                  availableTimeSignatures.map((timeSignature) => (
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
                  ))
                )}
              </div>
            </fieldset>
          </div>
        </div>
      )}
    </div>
  )
}
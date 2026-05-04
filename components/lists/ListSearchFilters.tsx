"use client"

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type ListSearchFiltersProps = {
  basePath: string
  searchLabel: string
  searchPlaceholder: string
  searchValue: string
  selectedSize: string
  selectedStyles: string[]
  selectedSource: string
  selectedVisibility: string
  availableStyles: string[]
  hasActiveFilters: boolean
}

type ActiveChip =
  | {
      id: string
      group: "size"
      label: string
    }
  | {
      id: string
      group: "style"
      value: string
      label: string
    }
  | {
      id: string
      group: "source"
      label: string
    }
  | {
      id: string
      group: "visibility"
      label: string
    }

const SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 tunes" },
  { value: "11-25", label: "11–25 tunes" },
  { value: "26-50", label: "26–50 tunes" },
  { value: "51-plus", label: "51+ tunes" },
] as const

const SOURCE_OPTIONS = [
  { value: "mine", label: "Mine" },
  { value: "imported", label: "Imported" },
] as const

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
] as const

export default function ListSearchFilters({
  basePath,
  searchLabel,
  searchPlaceholder,
  searchValue,
  selectedSize,
  selectedStyles,
  selectedSource,
  selectedVisibility,
  availableStyles,
  hasActiveFilters,
}: ListSearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [query, setQuery] = useState(searchValue)
  const panelRef = useRef<HTMLDivElement | null>(null)

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

    const currentQuery = searchParams.get("q")
    if (currentQuery) {
      params.set("q", currentQuery)
    }

    const currentSize = searchParams.get("size")
    if (currentSize) {
      params.set("size", currentSize)
    }

    const currentSource = searchParams.get("source")
    if (currentSource) {
      params.set("source", currentSource)
    }

    const currentVisibility = searchParams.get("visibility")
    if (currentVisibility) {
      params.set("visibility", currentVisibility)
    }

    for (const style of searchParams.getAll("style")) {
      if (style) params.append("style", style)
    }

    return params
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams()

    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      params.set("q", trimmedQuery)
    }

    if (selectedSize) {
      params.set("size", selectedSize)
    }

    if (selectedSource) {
      params.set("source", selectedSource)
    }

    if (selectedVisibility) {
      params.set("visibility", selectedVisibility)
    }

    for (const style of selectedStyles) {
      params.append("style", style)
    }

    navigateWithParams(params)
  }

  function handleStyleChange(style: string, checked: boolean) {
    const params = buildParamsFromCurrentSearch()
    const existingValues = params.getAll("style").filter(Boolean)

    params.delete("style")

    const nextValues = checked
      ? Array.from(new Set([...existingValues, style]))
      : existingValues.filter((existingValue) => existingValue !== style)

    for (const nextValue of nextValues) {
      params.append("style", nextValue)
    }

    navigateWithParams(params)
  }

  function handleSingleSelectChange(
    groupName: "size" | "source" | "visibility",
    value: string
  ) {
    const params = buildParamsFromCurrentSearch()

    if (params.get(groupName) === value) {
      params.delete(groupName)
    } else {
      params.set(groupName, value)
    }

    navigateWithParams(params)
  }

  function handleRemoveChip(chip: ActiveChip) {
    const params = buildParamsFromCurrentSearch()

    if (chip.group === "style") {
      const existingValues = params.getAll("style").filter(Boolean)
      params.delete("style")

      for (const existingValue of existingValues) {
        if (existingValue !== chip.value) {
          params.append("style", existingValue)
        }
      }

      navigateWithParams(params)
      return
    }

    if (chip.group === "size") {
      params.delete("size")
      navigateWithParams(params)
      return
    }

    if (chip.group === "source") {
      params.delete("source")
      navigateWithParams(params)
      return
    }

    params.delete("visibility")
    navigateWithParams(params)
  }

  function handleClearAll() {
    navigateWithParams(new URLSearchParams())
    setIsPanelOpen(false)
  }

  const activeFilterCount =
    (selectedSize ? 1 : 0) +
    selectedStyles.length +
    (selectedSource ? 1 : 0) +
    (selectedVisibility ? 1 : 0)

  const activeChips = useMemo<ActiveChip[]>(
    () => [
      ...(selectedSize
        ? [
            {
              id: `size:${selectedSize}`,
              group: "size" as const,
              label:
                SIZE_OPTIONS.find((option) => option.value === selectedSize)?.label ??
                selectedSize,
            },
          ]
        : []),
      ...selectedStyles.map((style) => ({
        id: `style:${style}`,
        group: "style" as const,
        value: style,
        label: `Style: ${style}`,
      })),
      ...(selectedSource
        ? [
            {
              id: `source:${selectedSource}`,
              group: "source" as const,
              label:
                SOURCE_OPTIONS.find((option) => option.value === selectedSource)?.label ??
                selectedSource,
            },
          ]
        : []),
      ...(selectedVisibility
        ? [
            {
              id: `visibility:${selectedVisibility}`,
              group: "visibility" as const,
              label:
                VISIBILITY_OPTIONS.find(
                  (option) => option.value === selectedVisibility
                )?.label ?? selectedVisibility,
            },
          ]
        : []),
    ],
    [selectedSize, selectedSource, selectedStyles, selectedVisibility]
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
              aria-controls="list-filter-panel"
            >
              {isPending
                ? "Updating..."
                : activeFilterCount > 0
                ? `Filters (${activeFilterCount})`
                : "Filters"}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm underline"
                disabled={isPending}
              >
                Clear filters
              </button>
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
                onClick={() => handleRemoveChip(chip)}
                className="rounded-full border px-3 py-1 text-sm"
                disabled={isPending}
              >
                {chip.label} ×
              </button>
            ))}
          </div>
        )}
      </form>

      {isPanelOpen && (
        <div
          id="list-filter-panel"
          className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border bg-white p-4 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">Filter lists</h3>
              <p className="text-sm text-gray-600">
                Narrow your list overview by size, style, source, or visibility.
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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <fieldset className="min-w-0 rounded-xl border p-3" disabled={isPending}>
              <legend className="px-1 text-sm font-medium">
                Size {selectedSize ? "(1)" : "(0)"}
              </legend>
              <div className="mt-2 space-y-2">
                {SIZE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="size"
                      value={option.value}
                      checked={selectedSize === option.value}
                      onChange={() => handleSingleSelectChange("size", option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0 rounded-xl border p-3" disabled={isPending}>
              <legend className="px-1 text-sm font-medium">
                Style ({selectedStyles.length})
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
                        checked={selectedStyles.includes(style)}
                        onChange={(event) =>
                          handleStyleChange(style, event.target.checked)
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
                Source {selectedSource ? "(1)" : "(0)"}
              </legend>
              <div className="mt-2 space-y-2">
                {SOURCE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="source"
                      value={option.value}
                      checked={selectedSource === option.value}
                      onChange={() => handleSingleSelectChange("source", option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0 rounded-xl border p-3" disabled={isPending}>
              <legend className="px-1 text-sm font-medium">
                Visibility {selectedVisibility ? "(1)" : "(0)"}
              </legend>
              <div className="mt-2 space-y-2">
                {VISIBILITY_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={selectedVisibility === option.value}
                      onChange={() =>
                        handleSingleSelectChange("visibility", option.value)
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>
      )}
    </div>
  )
}
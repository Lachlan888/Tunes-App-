"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react"
import FilterChip from "@/components/filters/FilterChip"
import FilterPanel from "@/components/filters/FilterPanel"
import FilterSection from "@/components/filters/FilterSection"
import FilterShell from "@/components/filters/FilterShell"

type PublicListSortValue = "recent" | "alpha" | "tune-count"

type PublicListSearchFiltersProps = {
  basePath: string
  searchValue: string
  selectedStyles: string[]
  selectedSort: PublicListSortValue
  availableStyles: string[]
  hasActiveFilters: boolean
}

type ActiveChip =
  | {
      id: string
      group: "style"
      value: string
      label: string
    }
  | {
      id: string
      group: "sort"
      value: PublicListSortValue
      label: string
    }

const SORT_OPTIONS: Array<{ value: PublicListSortValue; label: string }> = [
  { value: "recent", label: "Recently added" },
  { value: "alpha", label: "Alphabetical" },
  { value: "tune-count", label: "Most tunes" },
]

function isPublicListSortValue(value: string): value is PublicListSortValue {
  return SORT_OPTIONS.some((option) => option.value === value)
}

export default function PublicListSearchFilters({
  basePath,
  searchValue,
  selectedStyles,
  selectedSort,
  availableStyles,
  hasActiveFilters,
}: PublicListSearchFiltersProps) {
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

    const currentSort = searchParams.get("sort")
    if (currentSort && currentSort !== "recent") {
      params.set("sort", currentSort)
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

    if (selectedSort !== "recent") {
      params.set("sort", selectedSort)
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

  function handleSortChange(value: PublicListSortValue) {
    const params = buildParamsFromCurrentSearch()

    if (value === "recent") {
      params.delete("sort")
    } else {
      params.set("sort", value)
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

    params.delete("sort")
    navigateWithParams(params)
  }

  function handleClearAll() {
    navigateWithParams(new URLSearchParams())
    setIsPanelOpen(false)
  }

  const activeFilterCount = selectedStyles.length + (selectedSort !== "recent" ? 1 : 0)

  const activeChips = useMemo<ActiveChip[]>(
    () => [
      ...selectedStyles.map((style) => ({
        id: `style:${style}`,
        group: "style" as const,
        value: style,
        label: `Style: ${style}`,
      })),
      ...(selectedSort !== "recent"
        ? [
            {
              id: `sort:${selectedSort}`,
              group: "sort" as const,
              value: selectedSort,
              label:
                SORT_OPTIONS.find((option) => option.value === selectedSort)
                  ?.label ?? selectedSort,
            },
          ]
        : []),
    ],
    [selectedSort, selectedStyles]
  )

  const normalisedSort = isPublicListSortValue(selectedSort)
    ? selectedSort
    : "recent"

  return (
    <FilterShell
      panelRef={panelRef}
      searchLabel="Search public lists"
      searchPlaceholder="Search public lists"
      searchValue={query}
      onSearchValueChange={setQuery}
      onSearchSubmit={handleSearchSubmit}
      isPending={isPending}
      isPanelOpen={isPanelOpen}
      onTogglePanel={() => setIsPanelOpen((current) => !current)}
      panelId="public-list-filter-panel"
      activeFilterCount={activeFilterCount}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={handleClearAll}
      activeChips={
        activeChips.length > 0
          ? activeChips.map((chip) => (
              <FilterChip
                key={chip.id}
                label={chip.label}
                onRemove={() => handleRemoveChip(chip)}
                disabled={isPending}
              />
            ))
          : null
      }
      panel={
        <FilterPanel
          id="public-list-filter-panel"
          title="Filter public lists"
          description="Narrow public lists by tune style or browsing order."
          hasActiveFilters={hasActiveFilters}
          isPending={isPending}
          onClearAll={handleClearAll}
          onClose={() => setIsPanelOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FilterSection
              title="Style"
              count={selectedStyles.length}
              disabled={isPending}
            >
              {availableStyles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No styles available.
                </p>
              ) : (
                availableStyles.map((style) => (
                  <label
                    key={style}
                    className="flex items-center gap-2 text-sm"
                  >
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
            </FilterSection>

            <FilterSection
              title="Sort"
              count={normalisedSort !== "recent" ? 1 : 0}
              disabled={isPending}
            >
              {SORT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={normalisedSort === option.value}
                    onChange={() => handleSortChange(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </FilterSection>
          </div>
        </FilterPanel>
      }
    />
  )
}
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
  { value: "imported", label: "Copied" },
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

    params.delete(chip.group)
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
                SIZE_OPTIONS.find((option) => option.value === selectedSize)
                  ?.label ?? selectedSize,
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
                SOURCE_OPTIONS.find((option) => option.value === selectedSource)
                  ?.label ?? selectedSource,
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
    <FilterShell
      panelRef={panelRef}
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      searchValue={query}
      onSearchValueChange={setQuery}
      onSearchSubmit={handleSearchSubmit}
      isPending={isPending}
      isPanelOpen={isPanelOpen}
      onTogglePanel={() => setIsPanelOpen((current) => !current)}
      panelId="list-filter-panel"
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
          id="list-filter-panel"
          title="Filter lists"
          description="Narrow your list overview by size, style, source, or visibility."
          hasActiveFilters={hasActiveFilters}
          isPending={isPending}
          onClearAll={handleClearAll}
          onClose={() => setIsPanelOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FilterSection
              title="Size"
              count={selectedSize ? 1 : 0}
              disabled={isPending}
            >
              {SIZE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name="size"
                    value={option.value}
                    checked={selectedSize === option.value}
                    onChange={() =>
                      handleSingleSelectChange("size", option.value)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </FilterSection>

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
              title="Source"
              count={selectedSource ? 1 : 0}
              disabled={isPending}
            >
              {SOURCE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="radio"
                    name="source"
                    value={option.value}
                    checked={selectedSource === option.value}
                    onChange={() =>
                      handleSingleSelectChange("source", option.value)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </FilterSection>

            <FilterSection
              title="Visibility"
              count={selectedVisibility ? 1 : 0}
              disabled={isPending}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm"
                >
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
            </FilterSection>
          </div>
        </FilterPanel>
      }
    />
  )
}

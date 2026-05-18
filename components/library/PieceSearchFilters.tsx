"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react"
import FilterChip from "@/components/filters/FilterChip"
import FilterPanel from "@/components/filters/FilterPanel"
import FilterSection from "@/components/filters/FilterSection"
import FilterShell from "@/components/filters/FilterShell"

type PreservedParamValue = string | string[]

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
  preservedParams?: Record<string, PreservedParamValue>
}

function toSafeArray(value: string[] | string | undefined) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function appendPreservedParams(
  params: URLSearchParams,
  preservedParams: Record<string, PreservedParamValue>
) {
  for (const [key, value] of Object.entries(preservedParams)) {
    params.delete(key)

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => {
        params.append(key, item)
      })
    } else if (value) {
      params.set(key, value)
    }
  }
}

function formatFilterLabel(group: "key" | "style" | "time_signature") {
  if (group === "key") return "Key"
  if (group === "style") return "Style"
  return "Time"
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

  function navigateWithParams(params: URLSearchParams) {
    const href = params.toString() ? `${basePath}?${params.toString()}` : basePath

    startTransition(() => {
      router.push(href)
    })
  }

  function buildParamsFromCurrentSearch() {
    const params = new URLSearchParams()

    appendPreservedParams(params, preservedParams)

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

    appendPreservedParams(params, preservedParams)

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

    appendPreservedParams(params, preservedParams)

    navigateWithParams(params)
    setIsPanelOpen(false)
  }

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
    <FilterShell
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      searchValue={query}
      onSearchValueChange={setQuery}
      onSearchSubmit={handleSearchSubmit}
      isPending={isPending}
      isPanelOpen={isPanelOpen}
      onTogglePanel={() => setIsPanelOpen((current) => !current)}
      panelId="piece-filter-panel"
      activeFilterCount={activeFilterCount}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={handleClearAll}
      activeChips={
        activeChips.length > 0
          ? activeChips.map((chip) => (
              <FilterChip
                key={chip.id}
                label={`${chip.groupLabel}: ${chip.value}`}
                onRemove={() => handleRemoveSingleFilter(chip.group, chip.value)}
                disabled={isPending}
              />
            ))
          : null
      }
      panel={
        <FilterPanel
          id="piece-filter-panel"
          title="Filter tunes"
          description="Select as many filters as you like."
          hasActiveFilters={hasActiveFilters}
          isPending={isPending}
          onClearAll={handleClearAll}
          onClose={() => setIsPanelOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <FilterSection
              title="Key"
              count={safeSelectedKeys.length}
              disabled={isPending}
            >
              {availableKeys.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No keys available.
                </p>
              ) : (
                availableKeys.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="key"
                      value={key}
                      checked={safeSelectedKeys.includes(key)}
                      onChange={(event) =>
                        handleMultiCheckboxChange(
                          "key",
                          key,
                          event.target.checked
                        )
                      }
                    />
                    <span>{key}</span>
                  </label>
                ))
              )}
            </FilterSection>

            <FilterSection
              title="Style"
              count={safeSelectedStyles.length}
              disabled={isPending}
            >
              {availableStyles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No styles available.
                </p>
              ) : (
                availableStyles.map((style) => (
                  <label key={style} className="flex items-center gap-2 text-sm">
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
            </FilterSection>

            <FilterSection
              title="Time"
              count={safeSelectedTimeSignatures.length}
              disabled={isPending}
            >
              {availableTimeSignatures.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No time signatures available.
                </p>
              ) : (
                availableTimeSignatures.map((timeSignature) => (
                  <label
                    key={timeSignature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="time_signature"
                      value={timeSignature}
                      checked={safeSelectedTimeSignatures.includes(
                        timeSignature
                      )}
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
            </FilterSection>
          </div>
        </FilterPanel>
      }
    />
  )
}
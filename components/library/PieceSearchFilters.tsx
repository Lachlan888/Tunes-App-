"use client"

import { useRouter } from "next/navigation"
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
type PieceSort = "title_asc" | "newest" | "oldest"

type PieceSearchFiltersProps = {
  basePath: string
  searchLabel: string
  searchPlaceholder: string
  searchValue: string

  selectedKeys?: string[]
  selectedStyles?: string[]
  selectedTimeSignatures?: string[]
  selectedSort?: PieceSort

  selectedKey?: string
  selectedStyle?: string
  selectedTimeSignature?: string

  availableKeys: string[]
  availableStyles: string[]
  availableTimeSignatures: string[]
  hasActiveFilters: boolean
  preservedParams?: Record<string, PreservedParamValue>
}

type FilterGroup = "key" | "style" | "time_signature"

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

function formatFilterLabel(group: FilterGroup) {
  if (group === "key") return "Key"
  if (group === "style") return "Style"
  return "Time"
}

function buildChipId(group: FilterGroup, value: string) {
  return `${group}:${value}`
}

function toggleValue(values: string[], value: string, checked: boolean) {
  if (checked) {
    return Array.from(new Set([...values, value]))
  }

  return values.filter((existingValue) => existingValue !== value)
}

function arraysMatch(first: string[], second: string[]) {
  if (first.length !== second.length) return false

  const firstSorted = [...first].sort()
  const secondSorted = [...second].sort()

  return firstSorted.every((value, index) => value === secondSorted[index])
}

export default function PieceSearchFilters({
  basePath,
  searchLabel,
  searchPlaceholder,
  searchValue,

  selectedKeys,
  selectedStyles,
  selectedTimeSignatures,
  selectedSort = "title_asc",

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
  const [isPending, startTransition] = useTransition()
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [query, setQuery] = useState(searchValue)

  const serverSelectedKeys = useMemo(
    () =>
      selectedKeys && selectedKeys.length > 0
        ? selectedKeys
        : toSafeArray(selectedKey),
    [selectedKeys, selectedKey]
  )

  const serverSelectedStyles = useMemo(
    () =>
      selectedStyles && selectedStyles.length > 0
        ? selectedStyles
        : toSafeArray(selectedStyle),
    [selectedStyles, selectedStyle]
  )

  const serverSelectedTimeSignatures = useMemo(
    () =>
      selectedTimeSignatures && selectedTimeSignatures.length > 0
        ? selectedTimeSignatures
        : toSafeArray(selectedTimeSignature),
    [selectedTimeSignatures, selectedTimeSignature]
  )

  const [draftKeys, setDraftKeys] = useState(serverSelectedKeys)
  const [draftStyles, setDraftStyles] = useState(serverSelectedStyles)
  const [draftTimeSignatures, setDraftTimeSignatures] = useState(
    serverSelectedTimeSignatures
  )

  useEffect(() => {
    setQuery(searchValue)
  }, [searchValue])

  useEffect(() => {
    if (!arraysMatch(draftKeys, serverSelectedKeys)) {
      setDraftKeys(serverSelectedKeys)
    }

    if (!arraysMatch(draftStyles, serverSelectedStyles)) {
      setDraftStyles(serverSelectedStyles)
    }

    if (!arraysMatch(draftTimeSignatures, serverSelectedTimeSignatures)) {
      setDraftTimeSignatures(serverSelectedTimeSignatures)
    }
    // The draft values are intentionally omitted here.
    // This effect syncs local optimistic state when the server URL state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSelectedKeys, serverSelectedStyles, serverSelectedTimeSignatures])

  function buildParamsFromSelections({
    nextQuery,
    keys,
    styles,
    timeSignatures,
    sort,
  }: {
    nextQuery: string
    keys: string[]
    styles: string[]
    timeSignatures: string[]
    sort?: PieceSort
  }) {
    const params = new URLSearchParams()

    appendPreservedParams(params, preservedParams)

    const trimmedQuery = nextQuery.trim()
    if (trimmedQuery) {
      params.set("q", trimmedQuery)
    }

    for (const key of keys) {
      if (key) params.append("key", key)
    }

    for (const style of styles) {
      if (style) params.append("style", style)
    }

    for (const timeSignature of timeSignatures) {
      if (timeSignature) params.append("time_signature", timeSignature)
    }

    const nextSort = sort ?? selectedSort

    if (nextSort !== "title_asc") {
      params.set("sort", nextSort)
    }

    return params
  }

  function navigateWithParams(params: URLSearchParams) {
    const href = params.toString() ? `${basePath}?${params.toString()}` : basePath

    startTransition(() => {
      router.push(href)
    })
  }

  function navigateWithDraftSelections({
    keys = draftKeys,
    styles = draftStyles,
    timeSignatures = draftTimeSignatures,
    nextQuery = query,
    sort = selectedSort,
  }: {
    keys?: string[]
    styles?: string[]
    timeSignatures?: string[]
    nextQuery?: string
    sort?: PieceSort
  }) {
    const params = buildParamsFromSelections({
      nextQuery,
      keys,
      styles,
      timeSignatures,
      sort,
    })

    navigateWithParams(params)
  }

  function handleMultiCheckboxChange(
    groupName: FilterGroup,
    value: string,
    checked: boolean
  ) {
    if (groupName === "key") {
      const nextKeys = toggleValue(draftKeys, value, checked)
      setDraftKeys(nextKeys)
      navigateWithDraftSelections({ keys: nextKeys })
      return
    }

    if (groupName === "style") {
      const nextStyles = toggleValue(draftStyles, value, checked)
      setDraftStyles(nextStyles)
      navigateWithDraftSelections({ styles: nextStyles })
      return
    }

    const nextTimeSignatures = toggleValue(
      draftTimeSignatures,
      value,
      checked
    )
    setDraftTimeSignatures(nextTimeSignatures)
    navigateWithDraftSelections({ timeSignatures: nextTimeSignatures })
  }

  function handleSortChange(nextSort: PieceSort) {
    navigateWithDraftSelections({ sort: nextSort })
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuery = query.trim()
    setQuery(trimmedQuery)

    navigateWithDraftSelections({
      nextQuery: trimmedQuery,
    })
  }

  function handleRemoveSingleFilter(groupName: FilterGroup, value: string) {
    if (groupName === "key") {
      const nextKeys = draftKeys.filter(
        (existingValue) => existingValue !== value
      )
      setDraftKeys(nextKeys)
      navigateWithDraftSelections({ keys: nextKeys })
      return
    }

    if (groupName === "style") {
      const nextStyles = draftStyles.filter(
        (existingValue) => existingValue !== value
      )
      setDraftStyles(nextStyles)
      navigateWithDraftSelections({ styles: nextStyles })
      return
    }

    const nextTimeSignatures = draftTimeSignatures.filter(
      (existingValue) => existingValue !== value
    )
    setDraftTimeSignatures(nextTimeSignatures)
    navigateWithDraftSelections({ timeSignatures: nextTimeSignatures })
  }

  function handleClearAll() {
    setQuery("")
    setDraftKeys([])
    setDraftStyles([])
    setDraftTimeSignatures([])

    const params = buildParamsFromSelections({
      nextQuery: "",
      keys: [],
      styles: [],
      timeSignatures: [],
      sort: selectedSort,
    })

    navigateWithParams(params)
    setIsPanelOpen(false)
  }

  const activeFilterCount =
    draftKeys.length + draftStyles.length + draftTimeSignatures.length

  const optimisticHasActiveFilters = query.trim() !== "" || activeFilterCount > 0

  const activeChips = useMemo(
    () => [
      ...draftKeys.map((value) => ({
        id: buildChipId("key", value),
        group: "key" as const,
        groupLabel: formatFilterLabel("key"),
        value,
      })),
      ...draftStyles.map((value) => ({
        id: buildChipId("style", value),
        group: "style" as const,
        groupLabel: formatFilterLabel("style"),
        value,
      })),
      ...draftTimeSignatures.map((value) => ({
        id: buildChipId("time_signature", value),
        group: "time_signature" as const,
        groupLabel: formatFilterLabel("time_signature"),
        value,
      })),
    ],
    [draftKeys, draftStyles, draftTimeSignatures]
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
      hasActiveFilters={optimisticHasActiveFilters || hasActiveFilters}
      onClearFilters={handleClearAll}
      activeChips={
        activeChips.length > 0
          ? activeChips.map((chip) => (
              <FilterChip
                key={chip.id}
                label={`${chip.groupLabel}: ${chip.value}`}
                onRemove={() => handleRemoveSingleFilter(chip.group, chip.value)}
                disabled={false}
              />
            ))
          : null
      }
      panel={
        <FilterPanel
          id="piece-filter-panel"
          title="Filter tunes"
          description="Select as many filters as you like."
          hasActiveFilters={optimisticHasActiveFilters || hasActiveFilters}
          isPending={isPending}
          onClearAll={handleClearAll}
          onClose={() => setIsPanelOpen(false)}
        >
          <div className="grid gap-4 md:grid-cols-4">
            <FilterSection title="Sort" count={0} disabled={false}>
              <label className="flex flex-col gap-2 text-sm">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Order
                </span>

                <select
                  value={selectedSort}
                  onChange={(event) =>
                    handleSortChange(event.target.value as PieceSort)
                  }
                  className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="title_asc">Title A–Z</option>
                  <option value="newest">Recently added first</option>
                  <option value="oldest">Oldest added first</option>
                </select>
              </label>
            </FilterSection>

            <FilterSection title="Key" count={draftKeys.length} disabled={false}>
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
                      checked={draftKeys.includes(key)}
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
              count={draftStyles.length}
              disabled={false}
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
                      checked={draftStyles.includes(style)}
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
              count={draftTimeSignatures.length}
              disabled={false}
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
                      checked={draftTimeSignatures.includes(timeSignature)}
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
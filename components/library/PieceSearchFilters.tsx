"use client"

import { useRouter } from "next/navigation"
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react"
import FilterChip from "@/components/filters/FilterChip"
import FilterPanel from "@/components/filters/FilterPanel"
import FilterSection from "@/components/filters/FilterSection"
import FilterShell from "@/components/filters/FilterShell"
import { formStyles } from "@/components/ui/formStyles"
import {
  countPieceFilterDraftMatches,
  formatTuneResultsStatement,
} from "@/lib/tune-collections/filter-drafts"
import type { PieceFilterOption } from "@/lib/types"

type PreservedParamValue = string | string[]
type PieceSort = "title_asc" | "newest" | "oldest"

export type PieceGroupOption = {
  value: string
  label: string
}

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
  totalCount?: number
  countItems?: PieceFilterOption[]
  prospectiveCountExact?: boolean
  sticky?: boolean
  toolbarActions?: ReactNode
  selectedGroup?: string
  groupOptions?: PieceGroupOption[]
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
      value.filter(Boolean).forEach((item) => params.append(key, item))
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
  if (checked) return Array.from(new Set([...values, value]))
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
  totalCount,
  countItems = [],
  prospectiveCountExact = true,
  sticky = false,
  toolbarActions,
  selectedGroup = "none",
  groupOptions = [],
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
    if (!arraysMatch(draftKeys, serverSelectedKeys)) setDraftKeys(serverSelectedKeys)
    if (!arraysMatch(draftStyles, serverSelectedStyles)) {
      setDraftStyles(serverSelectedStyles)
    }
    if (!arraysMatch(draftTimeSignatures, serverSelectedTimeSignatures)) {
      setDraftTimeSignatures(serverSelectedTimeSignatures)
    }
    // Drafts intentionally follow applied URL state after back/forward navigation.
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
    if (trimmedQuery) params.set("q", trimmedQuery)
    keys.filter(Boolean).forEach((value) => params.append("key", value))
    styles.filter(Boolean).forEach((value) => params.append("style", value))
    timeSignatures
      .filter(Boolean)
      .forEach((value) => params.append("time_signature", value))
    const nextSort = sort ?? selectedSort
    if (nextSort !== "title_asc") params.set("sort", nextSort)
    return params
  }

  function navigateWithParams(params: URLSearchParams) {
    const href = params.toString() ? `${basePath}?${params.toString()}` : basePath
    startTransition(() => router.push(href))
  }

  function navigateApplied({
    nextQuery = searchValue,
    keys = serverSelectedKeys,
    styles = serverSelectedStyles,
    timeSignatures = serverSelectedTimeSignatures,
    sort = selectedSort,
  }: {
    nextQuery?: string
    keys?: string[]
    styles?: string[]
    timeSignatures?: string[]
    sort?: PieceSort
  } = {}) {
    navigateWithParams(
      buildParamsFromSelections({
        nextQuery,
        keys,
        styles,
        timeSignatures,
        sort,
      })
    )
  }

  function openPanel() {
    setDraftKeys(serverSelectedKeys)
    setDraftStyles(serverSelectedStyles)
    setDraftTimeSignatures(serverSelectedTimeSignatures)
    setIsPanelOpen(true)
  }

  function cancelPanel() {
    setDraftKeys(serverSelectedKeys)
    setDraftStyles(serverSelectedStyles)
    setDraftTimeSignatures(serverSelectedTimeSignatures)
    setIsPanelOpen(false)
  }

  function handleMultiCheckboxChange(
    groupName: FilterGroup,
    value: string,
    checked: boolean
  ) {
    if (groupName === "key") {
      setDraftKeys((current) => toggleValue(current, value, checked))
    } else if (groupName === "style") {
      setDraftStyles((current) => toggleValue(current, value, checked))
    } else {
      setDraftTimeSignatures((current) => toggleValue(current, value, checked))
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    setQuery(trimmedQuery)
    navigateApplied({ nextQuery: trimmedQuery })
  }

  function handleApplyFilters() {
    setIsPanelOpen(false)
    navigateApplied({
      keys: draftKeys,
      styles: draftStyles,
      timeSignatures: draftTimeSignatures,
    })
  }

  function handleRemoveAppliedFilter(groupName: FilterGroup, value: string) {
    if (groupName === "key") {
      navigateApplied({
        keys: serverSelectedKeys.filter((item) => item !== value),
      })
    } else if (groupName === "style") {
      navigateApplied({
        styles: serverSelectedStyles.filter((item) => item !== value),
      })
    } else {
      navigateApplied({
        timeSignatures: serverSelectedTimeSignatures.filter(
          (item) => item !== value
        ),
      })
    }
  }

  function handleClearAppliedFilters() {
    setQuery("")
    setDraftKeys([])
    setDraftStyles([])
    setDraftTimeSignatures([])
    navigateApplied({ nextQuery: "", keys: [], styles: [], timeSignatures: [] })
    setIsPanelOpen(false)
  }

  function handleGroupChange(group: string) {
    const params = buildParamsFromSelections({
      nextQuery: searchValue,
      keys: serverSelectedKeys,
      styles: serverSelectedStyles,
      timeSignatures: serverSelectedTimeSignatures,
      sort: selectedSort,
    })
    if (group === "none") params.delete("group")
    else params.set("group", group)
    navigateWithParams(params)
  }

  const appliedFilterCount =
    serverSelectedKeys.length +
    serverSelectedStyles.length +
    serverSelectedTimeSignatures.length
  const draftFilterCount =
    draftKeys.length + draftStyles.length + draftTimeSignatures.length
  const prospectiveCount = useMemo(
    () =>
      countItems.length > 0
        ? countPieceFilterDraftMatches(countItems, {
            keys: draftKeys,
            styles: draftStyles,
            timeSignatures: draftTimeSignatures,
          })
        : totalCount ?? 0,
    [countItems, draftKeys, draftStyles, draftTimeSignatures, totalCount]
  )
  const appliedChips = [
    ...serverSelectedKeys.map((value) => ({ group: "key" as const, value })),
    ...serverSelectedStyles.map((value) => ({ group: "style" as const, value })),
    ...serverSelectedTimeSignatures.map((value) => ({
      group: "time_signature" as const,
      value,
    })),
  ]
  const draftChips = [
    ...draftKeys.map((value) => ({ group: "key" as const, value })),
    ...draftStyles.map((value) => ({ group: "style" as const, value })),
    ...draftTimeSignatures.map((value) => ({
      group: "time_signature" as const,
      value,
    })),
  ]
  const panelId = `${basePath.replaceAll("/", "-") || "library"}-filter-panel`

  return (
    <FilterShell
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      searchValue={query}
      onSearchValueChange={setQuery}
      onSearchSubmit={handleSearchSubmit}
      isPending={isPending}
      isPanelOpen={isPanelOpen}
      onTogglePanel={() => (isPanelOpen ? cancelPanel() : openPanel())}
      panelId={panelId}
      activeFilterCount={appliedFilterCount}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={handleClearAppliedFilters}
      sticky={sticky}
      resultsStatement={
        totalCount === undefined
          ? undefined
          : formatTuneResultsStatement(totalCount, appliedFilterCount)
      }
      activeChips={
        appliedChips.length > 0
          ? appliedChips.map((chip) => (
              <FilterChip
                key={buildChipId(chip.group, chip.value)}
                label={`${formatFilterLabel(chip.group)}: ${chip.value}`}
                onRemove={() => handleRemoveAppliedFilter(chip.group, chip.value)}
                disabled={isPending}
              />
            ))
          : null
      }
      panel={
        <FilterPanel
          id={panelId}
          title="Filter tunes"
          description="Changes stay here until you apply them. Cancel keeps the current catalogue."
          hasActiveFilters={draftFilterCount > 0}
          isPending={isPending}
          onClearAll={() => {
            setDraftKeys([])
            setDraftStyles([])
            setDraftTimeSignatures([])
          }}
          onClose={cancelPanel}
          cancelLabel="Cancel"
          onApply={handleApplyFilters}
          applyLabel={`Show ${prospectiveCountExact ? "" : "at least "}${prospectiveCount} tune${prospectiveCount === 1 ? "" : "s"}`}
        >
          <div className="space-y-4">
            <section aria-labelledby="selected-filter-heading">
              <div className="flex items-center justify-between gap-3">
                <h3
                  id="selected-filter-heading"
                  className="text-sm font-semibold uppercase tracking-[0.14em] text-text-muted"
                >
                  Selected filters
                </h3>
                <span className="text-sm text-text-muted">
                  {prospectiveCountExact ? prospectiveCount : `${prospectiveCount}+`} matches
                </span>
              </div>
              <div className="mt-3 flex min-h-11 flex-wrap items-center gap-2">
                {draftChips.length > 0 ? (
                  draftChips.map((chip) => (
                    <FilterChip
                      key={`draft-${buildChipId(chip.group, chip.value)}`}
                      label={`${formatFilterLabel(chip.group)}: ${chip.value}`}
                      onRemove={() =>
                        handleMultiCheckboxChange(chip.group, chip.value, false)
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-text-muted">No filters selected.</p>
                )}
              </div>
            </section>

            <FilterSection title="Key" count={draftKeys.length} collapsible defaultOpen>
              {availableKeys.length === 0 ? (
                <p className="text-sm text-text-muted">No keys available.</p>
              ) : (
                availableKeys.map((key) => (
                  <label key={key} className="flex min-h-11 items-center gap-3 rounded-control px-2 text-sm hover:bg-surface-note">
                    <input
                      type="checkbox"
                      name="key"
                      value={key}
                      checked={draftKeys.includes(key)}
                      onChange={(event) =>
                        handleMultiCheckboxChange("key", key, event.target.checked)
                      }
                      className="h-5 w-5 accent-[var(--action-primary)]"
                    />
                    <span>{key}</span>
                  </label>
                ))
              )}
            </FilterSection>

            <FilterSection title="Style" count={draftStyles.length} collapsible>
              {availableStyles.length === 0 ? (
                <p className="text-sm text-text-muted">No styles available.</p>
              ) : (
                availableStyles.map((style) => (
                  <label key={style} className="flex min-h-11 items-center gap-3 rounded-control px-2 text-sm hover:bg-surface-note">
                    <input
                      type="checkbox"
                      name="style"
                      value={style}
                      checked={draftStyles.includes(style)}
                      onChange={(event) =>
                        handleMultiCheckboxChange("style", style, event.target.checked)
                      }
                      className="h-5 w-5 accent-[var(--action-primary)]"
                    />
                    <span>{style}</span>
                  </label>
                ))
              )}
            </FilterSection>

            <FilterSection title="Time" count={draftTimeSignatures.length} collapsible>
              {availableTimeSignatures.length === 0 ? (
                <p className="text-sm text-text-muted">No time signatures available.</p>
              ) : (
                availableTimeSignatures.map((timeSignature) => (
                  <label key={timeSignature} className="flex min-h-11 items-center gap-3 rounded-control px-2 text-sm hover:bg-surface-note">
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
                      className="h-5 w-5 accent-[var(--action-primary)]"
                    />
                    <span>{timeSignature}</span>
                  </label>
                ))
              )}
            </FilterSection>
          </div>
        </FilterPanel>
      }
    >
      <label className="min-w-0">
        <span className="sr-only">Sort tunes</span>
        <select
          aria-label="Sort tunes"
          value={selectedSort}
          onChange={(event) =>
            navigateApplied({ sort: event.target.value as PieceSort })
          }
          className={formStyles.select}
          disabled={isPending}
        >
          <option value="title_asc">Title A–Z</option>
          <option value="newest">Recently added</option>
          <option value="oldest">Oldest added</option>
        </select>
      </label>

      {groupOptions.length > 0 ? (
        <label className="min-w-0">
          <span className="sr-only">Group tunes</span>
          <select
            aria-label="Group tunes"
            value={selectedGroup}
            onChange={(event) => handleGroupChange(event.target.value)}
            className={formStyles.select}
            disabled={isPending}
          >
            {groupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {toolbarActions}
    </FilterShell>
  )
}

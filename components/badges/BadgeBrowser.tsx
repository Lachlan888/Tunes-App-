"use client"

import { useEffect, useMemo, useState } from "react"
import BadgeCard from "@/components/badges/BadgeCard"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import type { BadgeWithOwner } from "@/lib/types"

type BadgeBrowserProps = {
  badges: BadgeWithOwner[]
  viewerId: string | null
}

type BadgeFacetSummary = {
  styles: string[]
  keys: string[]
  timeSignatures: string[]
}

type BadgeViewMode = "all" | "received" | "created"
type BadgeProgressFilter = "all" | "in_progress" | "not_received"

function normaliseSearchText(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function uniqueSorted(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))
}

function getOwnerName(badge: BadgeWithOwner) {
  return (
    badge.owner_profile?.display_name ||
    badge.owner_profile?.username ||
    "Unknown user"
  )
}

function getBadgeProgressStatus(
  badge: BadgeWithOwner
): Exclude<BadgeProgressFilter, "all"> | "received" {
  if (badge.viewer_award) return "received"
  if ((badge.viewer_progress?.current ?? 0) > 0) return "in_progress"
  return "not_received"
}

function badgeMatchesViewMode({
  badge,
  viewerId,
  viewMode,
}: {
  badge: BadgeWithOwner
  viewerId: string | null
  viewMode: BadgeViewMode
}) {
  if (viewMode === "all") return true
  if (!viewerId) return false

  if (viewMode === "received") {
    return Boolean(badge.viewer_award)
  }

  if (viewMode === "created") {
    return badge.owner_user_id === viewerId
  }

  return true
}

function extractConditionFacets(conditionLogic: unknown): BadgeFacetSummary {
  const styles: string[] = []
  const keys: string[] = []
  const timeSignatures: string[] = []

  if (
    typeof conditionLogic !== "object" ||
    conditionLogic === null ||
    !("conditions" in conditionLogic) ||
    !Array.isArray(conditionLogic.conditions)
  ) {
    return {
      styles,
      keys,
      timeSignatures,
    }
  }

  for (const condition of conditionLogic.conditions) {
    if (
      typeof condition !== "object" ||
      condition === null ||
      !("filters" in condition) ||
      typeof condition.filters !== "object" ||
      condition.filters === null
    ) {
      continue
    }

    const filters = condition.filters as Record<string, unknown>

    if (typeof filters.style === "string" && filters.style.trim()) {
      styles.push(filters.style.trim())
    }

    if (typeof filters.key === "string" && filters.key.trim()) {
      keys.push(filters.key.trim())
    }

    if (
      typeof filters.time_signature === "string" &&
      filters.time_signature.trim()
    ) {
      timeSignatures.push(filters.time_signature.trim())
    }
  }

  return {
    styles: uniqueSorted(styles),
    keys: uniqueSorted(keys),
    timeSignatures: uniqueSorted(timeSignatures),
  }
}

function badgeMatchesSearch({
  badge,
  query,
  facets,
}: {
  badge: BadgeWithOwner
  query: string
  facets: BadgeFacetSummary
}) {
  const normalisedQuery = normaliseSearchText(query)

  if (!normalisedQuery) return true

  const searchableText = [
    badge.name,
    badge.description,
    badge.commentary,
    badge.category,
    badge.condition_summary,
    getOwnerName(badge),
    badge.owner_profile?.username,
    ...facets.styles,
    ...facets.keys,
    ...facets.timeSignatures,
  ]
    .map((value) => normaliseSearchText(value))
    .join(" ")

  return normalisedQuery
    .split(" ")
    .filter(Boolean)
    .every((word) => searchableText.includes(word))
}

function badgeMatchesFacet({
  badgeValues,
  selectedValue,
}: {
  badgeValues: string[]
  selectedValue: string
}) {
  if (!selectedValue) return true

  const normalisedSelectedValue = normaliseSearchText(selectedValue)

  return badgeValues.some(
    (value) => normaliseSearchText(value) === normalisedSelectedValue
  )
}

function badgeMatchesProgress({
  badge,
  progress,
}: {
  badge: BadgeWithOwner
  progress: BadgeProgressFilter
}) {
  if (progress === "all") return true

  return getBadgeProgressStatus(badge) === progress
}

type BadgeModeSwitcherProps = {
  viewMode: BadgeViewMode
  viewerId: string | null
  allCount: number
  receivedCount: number
  createdCount: number
  onChangeViewMode: (mode: BadgeViewMode) => void
}

function BadgeModeSwitcher({
  viewMode,
  viewerId,
  allCount,
  receivedCount,
  createdCount,
  onChangeViewMode,
}: BadgeModeSwitcherProps) {
  const options: Array<{
    value: BadgeViewMode
    label: string
    count: number
    disabled: boolean
  }> = [
    {
      value: "all",
      label: "All",
      count: allCount,
      disabled: false,
    },
    {
      value: "received",
      label: "Received",
      count: receivedCount,
      disabled: !viewerId,
    },
    {
      value: "created",
      label: "Created",
      count: createdCount,
      disabled: !viewerId,
    },
  ]

  return (
    <div className="rounded-3xl border border-border bg-card p-2 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isActive = viewMode === option.value

          return (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => onChangeViewMode(option.value)}
              className={[
                "rounded-2xl px-3 py-3 text-center text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                option.disabled ? "cursor-not-allowed opacity-45" : "",
              ].join(" ")}
            >
              <span className="block">{option.label}</span>
              <span className="mt-1 block text-xs opacity-80">
                {option.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

type BadgeFiltersProps = {
  query: string
  category: string
  style: string
  badgeKey: string
  progress: BadgeProgressFilter
  categoryOptions: string[]
  styleOptions: string[]
  keyOptions: string[]
  hasActiveFilters: boolean
  onChangeQuery: (value: string) => void
  onChangeCategory: (value: string) => void
  onChangeStyle: (value: string) => void
  onChangeKey: (value: string) => void
  onChangeProgress: (value: BadgeProgressFilter) => void
  onClearFilters: () => void
}

function BadgeFilters({
  query,
  category,
  style,
  badgeKey,
  progress,
  categoryOptions,
  styleOptions,
  keyOptions,
  hasActiveFilters,
  onChangeQuery,
  onChangeCategory,
  onChangeStyle,
  onChangeKey,
  onChangeProgress,
  onClearFilters,
}: BadgeFiltersProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(9.5rem,1fr))_auto]">
      <div className="space-y-2">
        <label
          htmlFor="badge-search"
          className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Search
        </label>
        <input
          id="badge-search"
          value={query}
          onChange={(event) => onChangeQuery(event.target.value)}
          placeholder="Search badges..."
          className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="badge-category"
          className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Type
        </label>
        <select
          id="badge-category"
          value={category}
          onChange={(event) => onChangeCategory(event.target.value)}
          className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <option value="">All types</option>
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="badge-style"
          className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Style
        </label>
        <select
          id="badge-style"
          value={style}
          onChange={(event) => onChangeStyle(event.target.value)}
          className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <option value="">Any style</option>
          {styleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="badge-key"
          className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Key
        </label>
        <select
          id="badge-key"
          value={badgeKey}
          onChange={(event) => onChangeKey(event.target.value)}
          className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <option value="">Any key</option>
          {keyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="badge-progress"
          className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Progress
        </label>
        <select
          id="badge-progress"
          value={progress}
          onChange={(event) =>
            onChangeProgress(event.target.value as BadgeProgressFilter)
          }
          className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          <option value="all">All progress</option>
          <option value="in_progress">In progress</option>
          <option value="not_received">Not received</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="w-full rounded-full border border-border bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

function getEmptyTitle(viewMode: BadgeViewMode) {
  if (viewMode === "received") return "No received badges"
  if (viewMode === "created") return "No created badges"
  return "No matching badges"
}

function getEmptyDescription({
  viewMode,
  hasActiveFilters,
}: {
  viewMode: BadgeViewMode
  hasActiveFilters: boolean
}) {
  if (hasActiveFilters) {
    return "Try clearing a filter or searching for a broader style, condition, badge name, or creator."
  }

  if (viewMode === "received") {
    return "You have not received any badges yet."
  }

  if (viewMode === "created") {
    return "You have not created any badges yet."
  }

  return "No public badges match this view."
}

export default function BadgeBrowser({
  badges,
  viewerId,
}: BadgeBrowserProps) {
  const [viewMode, setViewMode] = useState<BadgeViewMode>("all")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [style, setStyle] = useState("")
  const [key, setKey] = useState("")
  const [progress, setProgress] = useState<BadgeProgressFilter>("all")
  const [mobileIndex, setMobileIndex] = useState(0)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const badgeFacets = useMemo(() => {
    return new Map(
      badges.map((badge) => [
        badge.id,
        extractConditionFacets(badge.condition_logic),
      ])
    )
  }, [badges])

  const allCount = badges.length

  const receivedCount = useMemo(() => {
    if (!viewerId) return 0
    return badges.filter((badge) => Boolean(badge.viewer_award)).length
  }, [badges, viewerId])

  const createdCount = useMemo(() => {
    if (!viewerId) return 0
    return badges.filter((badge) => badge.owner_user_id === viewerId).length
  }, [badges, viewerId])

  const categoryOptions = useMemo(() => {
    return uniqueSorted(badges.map((badge) => badge.category))
  }, [badges])

  const styleOptions = useMemo(() => {
    return uniqueSorted(
      badges.flatMap((badge) => badgeFacets.get(badge.id)?.styles ?? [])
    )
  }, [badges, badgeFacets])

  const keyOptions = useMemo(() => {
    return uniqueSorted(
      badges.flatMap((badge) => badgeFacets.get(badge.id)?.keys ?? [])
    )
  }, [badges, badgeFacets])

  const filteredBadges = useMemo(() => {
    return badges.filter((badge) => {
      const facets =
        badgeFacets.get(badge.id) ??
        ({
          styles: [],
          keys: [],
          timeSignatures: [],
        } satisfies BadgeFacetSummary)

      const matchesViewMode = badgeMatchesViewMode({
        badge,
        viewerId,
        viewMode,
      })

      const matchesSearch = badgeMatchesSearch({
        badge,
        query,
        facets,
      })

      const matchesCategory = category ? badge.category === category : true

      const matchesStyle = badgeMatchesFacet({
        badgeValues: facets.styles,
        selectedValue: style,
      })

      const matchesKey = badgeMatchesFacet({
        badgeValues: facets.keys,
        selectedValue: key,
      })

      const matchesProgress = badgeMatchesProgress({
        badge,
        progress,
      })

      return (
        matchesViewMode &&
        matchesSearch &&
        matchesCategory &&
        matchesStyle &&
        matchesKey &&
        matchesProgress
      )
    })
  }, [
    badges,
    badgeFacets,
    category,
    key,
    progress,
    query,
    style,
    viewerId,
    viewMode,
  ])

  useEffect(() => {
    setMobileIndex(0)
  }, [category, key, progress, query, style, viewMode])

  useEffect(() => {
    if (mobileIndex > Math.max(0, filteredBadges.length - 1)) {
      setMobileIndex(Math.max(0, filteredBadges.length - 1))
    }
  }, [filteredBadges.length, mobileIndex])

  useEffect(() => {
    if (!viewerId && viewMode !== "all") {
      setViewMode("all")
    }
  }, [viewerId, viewMode])

  const hasActiveFilters = Boolean(
    query.trim() || category || style || key || progress !== "all"
  )

  const currentMobileBadge = filteredBadges[mobileIndex] ?? null
  const canGoPrevious = mobileIndex > 0
  const canGoNext = mobileIndex < filteredBadges.length - 1

  function clearFilters() {
    setQuery("")
    setCategory("")
    setStyle("")
    setKey("")
    setProgress("all")
    setMobileIndex(0)
  }

  function showPreviousBadge() {
    setMobileIndex((current) => Math.max(0, current - 1))
  }

  function showNextBadge() {
    setMobileIndex((current) =>
      Math.min(filteredBadges.length - 1, current + 1)
    )
  }

  const filterProps = {
    query,
    category,
    style,
    badgeKey: key,
    progress,
    categoryOptions,
    styleOptions,
    keyOptions,
    hasActiveFilters,
    onChangeQuery: setQuery,
    onChangeCategory: setCategory,
    onChangeStyle: setStyle,
    onChangeKey: setKey,
    onChangeProgress: setProgress,
    onClearFilters: clearFilters,
  }

  return (
    <section className="mt-5 space-y-5 md:mt-8 md:space-y-6">
      <BadgeModeSwitcher
        viewMode={viewMode}
        viewerId={viewerId}
        allCount={allCount}
        receivedCount={receivedCount}
        createdCount={createdCount}
        onChangeViewMode={setViewMode}
      />

      <div className="hidden rounded-3xl border border-border bg-card p-5 shadow-sm md:block">
        <BadgeFilters {...filterProps} />

        <div className="mt-5 border-t border-border pt-4 text-sm text-muted-foreground">
          <p>
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredBadges.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {badges.length}
            </span>{" "}
            badge{badges.length === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      {filteredBadges.length > 0 ? (
        <>
          <div className="md:hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Badge {mobileIndex + 1} of {filteredBadges.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={showPreviousBadge}
                  disabled={!canGoPrevious}
                  className="rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Show previous badge"
                >
                  Prev
                </button>

                <button
                  type="button"
                  onClick={showNextBadge}
                  disabled={!canGoNext}
                  className="rounded-full border border-border bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label="Show next badge"
                >
                  Next
                </button>
              </div>
            </div>

            {currentMobileBadge ? <BadgeCard badge={currentMobileBadge} /> : null}

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredBadges.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {badges.length}
                </span>
              </p>

              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                {hasActiveFilters ? "Edit filters" : "Search"}
              </button>
            </div>
          </div>

          <div className="hidden gap-6 md:grid xl:grid-cols-2">
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </>
      ) : (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {getEmptyTitle(viewMode)}
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {getEmptyDescription({
              viewMode,
              hasActiveFilters,
            })}
          </p>

          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="mt-5 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:hidden"
          >
            Edit filters
          </button>
        </section>
      )}

      <ResponsiveModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-3xl"
        eyebrow="Badge search"
        title="Search and filter"
        description="Find badges by name, category, style, key, or progress."
      >
        <div className="space-y-5">
          <BadgeFilters {...filterProps} />

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {filteredBadges.length} result
              {filteredBadges.length === 1 ? "" : "s"}
            </p>

            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Show badges
            </button>
          </div>
        </div>
      </ResponsiveModal>
    </section>
  )
}
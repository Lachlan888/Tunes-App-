"use client"

import { useMemo, useState } from "react"
import BadgeCard from "@/components/badges/BadgeCard"
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

type BadgeStatus = "all" | "received" | "in_progress" | "not_received"

type BadgeRelationship =
  | "all"
  | "received"
  | "created"
  | "received_or_created"

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

function getBadgeStatus(badge: BadgeWithOwner): Exclude<BadgeStatus, "all"> {
  if (badge.viewer_award) {
    return "received"
  }

  if ((badge.viewer_progress?.current ?? 0) > 0) {
    return "in_progress"
  }

  return "not_received"
}

function badgeMatchesRelationship({
  badge,
  viewerId,
  relationship,
}: {
  badge: BadgeWithOwner
  viewerId: string | null
  relationship: BadgeRelationship
}) {
  if (relationship === "all") {
    return true
  }

  if (!viewerId) {
    return false
  }

  const isReceived = Boolean(badge.viewer_award)
  const isCreated = badge.owner_user_id === viewerId

  if (relationship === "received") {
    return isReceived
  }

  if (relationship === "created") {
    return isCreated
  }

  if (relationship === "received_or_created") {
    return isReceived || isCreated
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

  if (!normalisedQuery) {
    return true
  }

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
  if (!selectedValue) {
    return true
  }

  const normalisedSelectedValue = normaliseSearchText(selectedValue)

  return badgeValues.some(
    (value) => normaliseSearchText(value) === normalisedSelectedValue
  )
}

export default function BadgeBrowser({
  badges,
  viewerId,
}: BadgeBrowserProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")
  const [style, setStyle] = useState("")
  const [key, setKey] = useState("")
  const [status, setStatus] = useState<BadgeStatus>("all")
  const [relationship, setRelationship] = useState<BadgeRelationship>("all")

  const badgeFacets = useMemo(() => {
    return new Map(
      badges.map((badge) => [
        badge.id,
        extractConditionFacets(badge.condition_logic),
      ])
    )
  }, [badges])

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

      const badgeStatus = getBadgeStatus(badge)
      const matchesStatus = status === "all" ? true : badgeStatus === status

      const matchesRelationship = badgeMatchesRelationship({
        badge,
        viewerId,
        relationship,
      })

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStyle &&
        matchesKey &&
        matchesStatus &&
        matchesRelationship
      )
    })
  }, [
    badges,
    badgeFacets,
    category,
    key,
    query,
    relationship,
    status,
    style,
    viewerId,
  ])

  const hasActiveFilters =
    query.trim() ||
    category ||
    style ||
    key ||
    status !== "all" ||
    relationship !== "all"

  function clearFilters() {
    setQuery("")
    setCategory("")
    setStyle("")
    setKey("")
    setStatus("all")
    setRelationship("all")
  }

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(9.5rem,1fr))_auto]">
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search badges, creators, styles..."
              className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="badge-relationship"
              className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Your badges
            </label>
            <select
              id="badge-relationship"
              value={relationship}
              onChange={(event) =>
                setRelationship(event.target.value as BadgeRelationship)
              }
              disabled={!viewerId}
              className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="all">All badges</option>
              <option value="received">Received</option>
              <option value="created">Created by me</option>
              <option value="received_or_created">Received or created</option>
            </select>
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
              onChange={(event) => setCategory(event.target.value)}
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
              Style mentioned
            </label>
            <select
              id="badge-style"
              value={style}
              onChange={(event) => setStyle(event.target.value)}
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
              Key mentioned
            </label>
            <select
              id="badge-key"
              value={key}
              onChange={(event) => setKey(event.target.value)}
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
              htmlFor="badge-status"
              className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground"
            >
              Progress
            </label>
            <select
              id="badge-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as BadgeStatus)}
              className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="all">All progress</option>
              <option value="received">Received</option>
              <option value="in_progress">In progress</option>
              <option value="not_received">Not received</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full rounded-full border border-border bg-background/70 px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
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

          <p>
            Use Your badges to show badges you have received, created, or both.
          </p>
        </div>
      </div>

      {filteredBadges.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            No matching badges
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Try clearing a filter or searching for a broader style, condition,
            badge name, or creator.
          </p>
        </section>
      )}
    </section>
  )
}
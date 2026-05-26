"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import UserIdentityLink from "@/components/UserIdentityLink"
import MobileCompareTuneRow from "@/components/compare/MobileCompareTuneRow"
import FilterPanel from "@/components/filters/FilterPanel"
import FilterSection from "@/components/filters/FilterSection"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { buildCompareHref, removeUserOnce } from "@/lib/compare-page"
import { pieceMatchesFilters } from "@/lib/search-filters"
import type { ProfileSearchRow } from "@/lib/profile-search"
import type { Piece } from "@/lib/types"

type MobileCompareResultsPanelProps = {
  compareHeading: string
  selectedProfiles: ProfileSearchRow[]
  filterPreservedUsers: string[]
  includePractice: boolean
  mutualPieces: Piece[]
  availableKeys: string[]
  availableStyles: string[]
  availableTimeSignatures: string[]
  onAddPerson: () => void
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((existingValue) => existingValue !== value)
    : [...values, value]
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "min-h-11 rounded-full border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          : "min-h-11 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      }
    >
      {label}
    </button>
  )
}

export default function MobileCompareResultsPanel({
  compareHeading,
  selectedProfiles,
  filterPreservedUsers,
  includePractice,
  mutualPieces,
  availableKeys,
  availableStyles,
  availableTimeSignatures,
  onAddPerson,
}: MobileCompareResultsPanelProps) {
  const router = useRouter()

  const [query, setQuery] = useState("")
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedTimeSignatures, setSelectedTimeSignatures] = useState<
    string[]
  >([])
  const [showFilters, setShowFilters] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredPieces = useMemo(
    () =>
      mutualPieces.filter((piece) =>
        pieceMatchesFilters(piece, {
          q: query,
          keys: selectedKeys,
          styles: selectedStyles,
          timeSignatures: selectedTimeSignatures,
        })
      ),
    [mutualPieces, query, selectedKeys, selectedStyles, selectedTimeSignatures]
  )

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedKeys.length > 0 ||
    selectedStyles.length > 0 ||
    selectedTimeSignatures.length > 0

  const activeFilterCount =
    selectedKeys.length + selectedStyles.length + selectedTimeSignatures.length

  function pushHref(href: string, pendingLabel: string) {
    setPendingAction(pendingLabel)

    startTransition(() => {
      router.push(href)
    })
  }

  function togglePracticeScope() {
    const href = buildCompareHref(filterPreservedUsers, {
      includePractice: !includePractice,
    })

    pushHref(href, "scope")
  }

  function removeProfile(profile: ProfileSearchRow) {
    if (!profile.username) return

    const nextUsers = removeUserOnce(filterPreservedUsers, profile.username)
    const href = buildCompareHref(nextUsers, { includePractice })

    pushHref(href, profile.id)
  }

  function clearLocalFilters() {
    setQuery("")
    setSelectedKeys([])
    setSelectedStyles([])
    setSelectedTimeSignatures([])
  }

  return (
    <div className="pb-8">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Common tunes
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground">
          {mutualPieces.length} tune{mutualPieces.length === 1 ? "" : "s"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {compareHeading}
        </p>
      </header>

      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Group
        </h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
            You
          </span>

          {selectedProfiles.map((profile) => (
            <span
              key={profile.id}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground"
            >
              <span className="min-w-0 truncate">
                <UserIdentityLink
                  username={profile.username}
                  displayName={profile.display_name}
                  fallbackLabel="Unnamed player"
                  className="decoration-primary decoration-2 underline-offset-4 hover:underline"
                />
              </span>

              {profile.username ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => removeProfile(profile)}
                  className="shrink-0 text-muted-foreground transition hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Remove ${
                    profile.display_name || profile.username || "player"
                  }`}
                >
                  {pendingAction === profile.id && isPending ? (
                    <LoadingSpinner label="Removing..." size="sm" decorative />
                  ) : (
                    "×"
                  )}
                </button>
              ) : null}
            </span>
          ))}

          <button
            type="button"
            onClick={onAddPerson}
            className="rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Add person
          </button>
        </div>
      </section>

      <section className="mb-6 border-y border-border py-3">
        <button
          type="button"
          disabled={isPending}
          onClick={togglePracticeScope}
          className="flex w-full items-center justify-between gap-4 text-left disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>
            <span className="block text-sm font-medium text-foreground">
              Include practice tunes
            </span>

            <span className="mt-1 block text-xs text-muted-foreground">
              {includePractice ? "Known + practice" : "Known only"}
            </span>
          </span>

          <span
            className={
              includePractice
                ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
            }
          >
            {pendingAction === "scope" && isPending ? (
              <span className="inline-flex items-center gap-1.5">
                <LoadingSpinner label="Updating..." size="sm" decorative />
                <span>Updating</span>
              </span>
            ) : includePractice ? (
              "On"
            ) : (
              "Off"
            )}
          </span>
        </button>
      </section>

      <section className="mb-5">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"
            placeholder="Search common tunes"
          />

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className={
              activeFilterCount > 0
                ? "shrink-0 rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
                : "shrink-0 rounded-full border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            }
            aria-expanded={showFilters}
            aria-controls="mobile-compare-filter-panel"
          >
            Filters{activeFilterCount > 0 ? ` ${activeFilterCount}` : ""}
          </button>
        </div>

        {hasActiveFilters ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {query.trim() ? (
              <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
                Search: {query.trim()}
              </span>
            ) : null}

            {selectedKeys.map((key) => (
              <span
                key={`key-${key}`}
                className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Key: {key}
              </span>
            ))}

            {selectedStyles.map((style) => (
              <span
                key={`style-${style}`}
                className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Style: {style}
              </span>
            ))}

            {selectedTimeSignatures.map((timeSignature) => (
              <span
                key={`time-${timeSignature}`}
                className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground"
              >
                Time: {timeSignature}
              </span>
            ))}
          </div>
        ) : null}

        {showFilters ? (
          <FilterPanel
            id="mobile-compare-filter-panel"
            title="Filter common tunes"
            description="Select filters, then close this panel to keep browsing the results."
            hasActiveFilters={hasActiveFilters}
            isPending={false}
            onClearAll={clearLocalFilters}
            onClose={() => setShowFilters(false)}
          >
            <div className="space-y-6">
              <FilterSection
                title="Key"
                count={selectedKeys.length}
                disabled={false}
              >
                {availableKeys.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No keys available.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {availableKeys.map((key) => (
                      <FilterChip
                        key={key}
                        label={key}
                        selected={selectedKeys.includes(key)}
                        onClick={() =>
                          setSelectedKeys(toggleValue(selectedKeys, key))
                        }
                      />
                    ))}
                  </div>
                )}
              </FilterSection>

              <FilterSection
                title="Style"
                count={selectedStyles.length}
                disabled={false}
              >
                {availableStyles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No styles available.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {availableStyles.map((style) => (
                      <FilterChip
                        key={style}
                        label={style}
                        selected={selectedStyles.includes(style)}
                        onClick={() =>
                          setSelectedStyles(toggleValue(selectedStyles, style))
                        }
                      />
                    ))}
                  </div>
                )}
              </FilterSection>

              <FilterSection
                title="Time"
                count={selectedTimeSignatures.length}
                disabled={false}
              >
                {availableTimeSignatures.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No time signatures available.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {availableTimeSignatures.map((timeSignature) => (
                      <FilterChip
                        key={timeSignature}
                        label={timeSignature}
                        selected={selectedTimeSignatures.includes(
                          timeSignature
                        )}
                        onClick={() =>
                          setSelectedTimeSignatures(
                            toggleValue(
                              selectedTimeSignatures,
                              timeSignature
                            )
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </FilterSection>
            </div>
          </FilterPanel>
        ) : null}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tunes
          </h2>

          <p className="text-xs text-muted-foreground">
            {filteredPieces.length} shown
          </p>
        </div>

        {filteredPieces.length > 0 ? (
          <ul className="divide-y divide-border border-y border-border">
            {filteredPieces.map((piece) => (
              <li key={piece.id}>
                <MobileCompareTuneRow piece={piece} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-y border-border py-6">
            <p className="text-sm font-medium text-foreground">
              No tunes match this view.
            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Clear the search or filters to return to all common tunes.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

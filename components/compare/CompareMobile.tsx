"use client"

import { useEffect, useState } from "react"
import ComparePageStatusMessages from "@/components/compare/ComparePageStatusMessages"
import MobileCompareAddPersonSheet from "@/components/compare/MobileCompareAddPersonSheet"
import MobileCompareResultsPanel from "@/components/compare/MobileCompareResultsPanel"
import type { CompareViewProps } from "@/components/compare/compare-view-types"

export default function CompareMobile(props: CompareViewProps) {
  const {
    selectedProfiles,
    filterPreservedUsers,
    includePractice,
    friendRequestStatus,
    error,
    primarySearchValue,
    compareSuggestions,
    matchingProfiles,
    searchMatches,
    matchedProfile,
    canCompare,
    redirectTo,
    compareHeading,
    mutualPieces,
    availableKeys,
    availableStyles,
    availableTimeSignatures,
    canShowResults,
  } = props

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)

  const hasSearchResolution =
    error === "multiple_matches" ||
    error === "user_not_found" ||
    error === "self_compare" ||
    (error === null && !matchedProfile && searchMatches.length > 0)

  const compareResultsKey = selectedProfiles
    .map((profile) => profile.id)
    .join(":")

  useEffect(() => {
    if (hasSearchResolution) {
      setIsAddSheetOpen(true)
    }
  }, [hasSearchResolution])

  return (
    <>
      {canShowResults ? (
        <MobileCompareResultsPanel
          key={compareResultsKey}
          compareHeading={compareHeading}
          selectedProfiles={selectedProfiles}
          filterPreservedUsers={filterPreservedUsers}
          includePractice={includePractice}
          mutualPieces={mutualPieces}
          availableKeys={availableKeys}
          availableStyles={availableStyles}
          availableTimeSignatures={availableTimeSignatures}
          onAddPerson={() => setIsAddSheetOpen(true)}
        />
      ) : (
        <>
          <header className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Compare
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground">
              Shared repertoire
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Add a player to see the tunes you have in common.
            </p>
          </header>

          <ComparePageStatusMessages
            friendRequestStatus={friendRequestStatus}
            error={error}
            primarySearchValue={primarySearchValue}
          />

          <section className="mb-7">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Start compare
            </h2>

            <div className="mt-3 border-y border-border py-4">
              <p className="text-sm leading-6 text-muted-foreground">
                You are always included. Add another player to start comparing
                repertoire.
              </p>

              <button
                type="button"
                onClick={() => setIsAddSheetOpen(true)}
                className="mt-4 rounded-full border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                Add person
              </button>
            </div>
          </section>

          {matchedProfile && !canCompare ? (
            <section className="border-y border-border py-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Permission needed
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This user requires friendship before comparison is available.
                Send a request from the full desktop compare view for now, or
                open their profile.
              </p>
            </section>
          ) : null}

          {compareSuggestions.length > 0 ? (
            <section className="mt-7">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Suggested friends
              </h2>

              <div className="mt-3 divide-y divide-border border-y border-border">
                {compareSuggestions.slice(0, 5).map((suggestion) => (
                  <div
                    key={suggestion.user_id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {suggestion.display_name ||
                          suggestion.username ||
                          "Unnamed player"}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        @{suggestion.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAddSheetOpen(true)}
                      className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <MobileCompareAddPersonSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        compareSuggestions={compareSuggestions}
        filterPreservedUsers={filterPreservedUsers}
        includePractice={includePractice}
        matchingProfiles={matchingProfiles}
        searchMatches={searchMatches}
        primarySearchValue={primarySearchValue}
        redirectTo={redirectTo}
        error={error}
      />
    </>
  )
}

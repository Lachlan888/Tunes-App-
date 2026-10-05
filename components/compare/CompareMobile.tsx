"use client"

import Link from "next/link"
import { useState } from "react"
import ComparePageStatusMessages from "@/components/compare/ComparePageStatusMessages"
import CompareInPersonSheet, {
  QrIcon,
} from "@/components/compare/CompareInPersonSheet"
import MobileCompareAddPersonSheet from "@/components/compare/MobileCompareAddPersonSheet"
import CompareOutcomeExperience from "@/components/compare/CompareOutcomeExperience"
import { buildCompareHref, removeUserOnce } from "@/lib/compare-page"
import EnterCompareCodeForm from "@/components/compare/EnterCompareCodeForm"
import type { CompareViewProps } from "@/components/compare/compare-view-types"
import PendingLinkButton from "@/components/PendingLinkButton"
import { getSuggestedCompareAction } from "@/lib/compare-suggestion-action"

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
    canShowResults,
    titleQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    overlapGroup,
  } = props

  const hasSearchResolution =
    error === "multiple_matches" ||
    error === "user_not_found" ||
    error === "self_compare" ||
    (error === null && !matchedProfile && searchMatches.length > 0)

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(hasSearchResolution)
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false)

  return (
    <>
      {canShowResults ? (
        <div className="pb-8">
          <header className="mb-5">
            <h1 className="font-sans text-4xl font-bold tracking-tight md:text-6xl">Compare</h1>
            <p className="mt-2 text-sm text-muted-foreground">{compareHeading}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedProfiles.map((profile) => (
                <Link
                  key={profile.id}
                  href={buildCompareHref(
                    profile.username
                      ? removeUserOnce(filterPreservedUsers, profile.username)
                      : filterPreservedUsers,
                    { includePractice }
                  )}
                  className="inline-flex min-h-11 items-center border-b border-hairline px-1 text-sm font-medium"
                >
                  {profile.display_name || profile.username || "Musician"} ×
                </Link>
              ))}
              <button type="button" onClick={() => setIsAddSheetOpen(true)} className="inline-flex min-h-11 rounded-control border border-primary px-4 text-sm font-semibold items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Add musician</button>
              <button type="button" onClick={() => setIsInviteSheetOpen(true)} className="inline-flex min-h-11 rounded-control bg-primary px-4 text-sm font-semibold text-primary-foreground items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">Compare in person</button>
            </div>
          </header>
          <CompareOutcomeExperience {...props} />
        </div>
      ) : (
        <>
          <header className="mb-6">
            <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Compare
            </h1>
          </header>

          <ComparePageStatusMessages
            friendRequestStatus={friendRequestStatus}
            error={error}
            primarySearchValue={primarySearchValue}
          />

          <section className="mb-7">
            <h2 className="text-xl font-semibold text-foreground">
              Start compare
            </h2>

            <div className="mt-3 flex flex-col gap-3 border-y border-border py-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsInviteSheetOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-primary bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                <QrIcon />
                <span>Compare in person</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddSheetOpen(true)}
                className="inline-flex min-h-12 rounded-control border border-border bg-surface-paper px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
              >
                Add person
              </button>
            </div>
            <EnterCompareCodeForm />
          </section>

          {matchedProfile && !canCompare ? (
            <section className="border-y border-border py-4">
              <h2 className="text-xl font-semibold text-foreground">
                Friend request needed
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This player only allows friends to compare repertoire. Open
                their profile to send a request.
              </p>
            </section>
          ) : null}

          {compareSuggestions.length > 0 ? (
            <section className="mt-7">
              <h2 className="text-xl font-semibold text-foreground">
                Suggested friends
              </h2>

              <div className="mt-3 divide-y divide-border border-y border-border">
                {compareSuggestions.slice(0, 5).map((suggestion) => (
                  (() => {
                    const action = getSuggestedCompareAction(
                      filterPreservedUsers,
                      suggestion.username
                    )

                    return (
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

                        <PendingLinkButton
                          href={buildCompareHref(action.nextUsers, {
                            q: titleQuery,
                            key: selectedKeys,
                            style: selectedStyles,
                            time_signature: selectedTimeSignatures,
                            includePractice,
                            group: overlapGroup,
                          })}
                          label={action.label}
                          pendingLabel="Loading comparison..."
                          disabled={action.disabled}
                          refresh
                          className="inline-flex min-h-11 shrink-0 rounded-control border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
                        />
                      </div>
                    )
                  })()
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
        titleQuery={titleQuery}
        selectedKeys={selectedKeys}
        selectedStyles={selectedStyles}
        selectedTimeSignatures={selectedTimeSignatures}
        overlapGroup={overlapGroup}
        matchingProfiles={matchingProfiles}
        searchMatches={searchMatches}
        primarySearchValue={primarySearchValue}
        redirectTo={redirectTo}
        error={error}
      />

      <CompareInPersonSheet
        isOpen={isInviteSheetOpen}
        onClose={() => setIsInviteSheetOpen(false)}
      />
    </>
  )
}

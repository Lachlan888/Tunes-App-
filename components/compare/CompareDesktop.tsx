import CompareBlockedSection from "@/components/compare/CompareBlockedSection"
import CompareCandidateListSection from "@/components/compare/CompareCandidateListSection"
import ComparePageStatusMessages from "@/components/compare/ComparePageStatusMessages"
import CompareSearchForm from "@/components/compare/CompareSearchForm"
import CompareSuggestionsSection from "@/components/compare/CompareSuggestionsSection"
import CurrentCompareGroupSection from "@/components/compare/CurrentCompareGroupSection"
import PageHeader from "@/components/ui/PageHeader"
import type { CompareViewProps } from "@/components/compare/compare-view-types"
import CompareOutcomeExperience from "@/components/compare/CompareOutcomeExperience"
import CompareInPersonLauncher from "@/components/compare/CompareInPersonLauncher"

export default function CompareDesktop(props: CompareViewProps) {
  const {
    selectedProfiles,
    filterPreservedUsers,
    titleQuery,
    selectedKeys,
    selectedStyles,
    selectedTimeSignatures,
    includePractice,
    friendRequestStatus,
    error,
    primarySearchValue,
    compareSuggestions,
    matchingProfiles,
    searchMatches,
    matchedProfile,
    isAcceptedFriend,
    canCompare,
    redirectTo,
    canShowResults,
  } = props
  return (
    <>
      <PageHeader title="Compare" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-stretch">
        <section className="min-w-0">
          <CompareSearchForm
            initialQuery=""
            selectedUsers={filterPreservedUsers}
            includePractice={includePractice}
          />
          <CompareInPersonLauncher />

          {filterPreservedUsers.length > 0 ? (
            <CurrentCompareGroupSection
              selectedProfiles={selectedProfiles}
              filterPreservedUsers={filterPreservedUsers}
              titleQuery={titleQuery}
              selectedKeys={selectedKeys}
              selectedStyles={selectedStyles}
              selectedTimeSignatures={selectedTimeSignatures}
              includePractice={includePractice}
            />
          ) : null}

          <ComparePageStatusMessages
            friendRequestStatus={friendRequestStatus}
            error={error}
            primarySearchValue={primarySearchValue}
          />

          <CompareSuggestionsSection
            compareSuggestions={compareSuggestions}
            filterPreservedUsers={filterPreservedUsers}
            includePractice={includePractice}
          />

          {error === "multiple_matches" ? (
            <CompareCandidateListSection
              title="Choose a player"
              profiles={matchingProfiles}
              filterPreservedUsers={filterPreservedUsers}
              includePractice={includePractice}
              redirectTo={redirectTo}
            />
          ) : null}

          {error === null && searchMatches.length > 0 ? (
            <CompareCandidateListSection
              title="Choose a player"
              profiles={searchMatches}
              filterPreservedUsers={filterPreservedUsers}
              includePractice={includePractice}
              redirectTo={redirectTo}
            />
          ) : null}

          {matchedProfile && error === null && !canCompare ? (
            <CompareBlockedSection
              matchedProfile={matchedProfile}
              isAcceptedFriend={isAcceptedFriend}
              redirectTo={redirectTo}
            />
          ) : null}
        </section>

        <aside className="min-w-0">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm lg:p-6">
            {canShowResults ? (
              <CompareOutcomeExperience {...props} />
            ) : (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Common tunes
                </h2>

                <p className="mt-3 text-sm text-muted-foreground md:text-base">
                  Add players to see your shared tunes.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}

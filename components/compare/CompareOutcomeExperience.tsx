import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import SuggestedSessionSet from "@/components/compare/SuggestedSessionSet"
import PieceSearchFilters from "@/components/library/PieceSearchFilters"
import PaginatedTuneCollection from "@/components/tunes/PaginatedTuneCollection"
import TuneRow from "@/components/tunes/TuneRow"
import { buildCompareHref } from "@/lib/compare-page"
import type { CompareViewProps } from "@/components/compare/compare-view-types"

type Props = Pick<
  CompareViewProps,
  | "selectedProfiles"
  | "currentUserId"
  | "filterPreservedUsers"
  | "includePractice"
  | "titleQuery"
  | "selectedKeys"
  | "selectedStyles"
  | "selectedTimeSignatures"
  | "availableKeys"
  | "availableStyles"
  | "availableTimeSignatures"
  | "hasActiveFilters"
  | "filteredPieces"
  | "outcomePieces"
  | "outcomeGroups"
  | "overlapGroup"
  | "overlapTotal"
  | "previousOverlapHref"
  | "nextOverlapHref"
>

export default function CompareOutcomeExperience(props: Props) {
  const {
    selectedProfiles,
    filterPreservedUsers,
    includePractice,
    outcomeGroups,
    outcomePieces,
    overlapGroup,
    overlapTotal,
    filteredPieces,
  } = props
  const pieceById = new Map(outcomePieces.map((piece) => [piece.id, piece]))
  const playablePieces = outcomeGroups.playableTogetherIds
    .map((id) => pieceById.get(id))
    .filter((piece): piece is NonNullable<typeof piece> => Boolean(piece))
  const participantNames = [
    "You",
    ...selectedProfiles.map(
      (profile) => profile.display_name || profile.username || "This musician"
    ),
  ]
  const participantIds = [
    props.currentUserId,
    ...selectedProfiles.map((profile) => profile.id),
  ]
  const teachCounts = participantIds.map((id, index) => ({
    name: participantNames[index],
    count: outcomeGroups.teachableByUserId[id]?.length ?? 0,
  }))

  function groupHref(group: "all" | "strong" | "shaky") {
    return buildCompareHref(filterPreservedUsers, {
      q: props.titleQuery,
      key: props.selectedKeys,
      style: props.selectedStyles,
      time_signature: props.selectedTimeSignatures,
      includePractice,
      group,
    })
  }

  return (
    <div className="compare-workbench">
      <section className="compare-summary border-y border-hairline py-5" aria-labelledby="playable-now-title">
        <h2 id="playable-now-title" className="mt-1 font-serif text-3xl font-bold text-text-primary md:text-4xl">
          You can play {outcomeGroups.playableTogetherIds.length} tune{outcomeGroups.playableTogetherIds.length === 1 ? "" : "s"} together now
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          This is repertoire overlap, not a score. Private practice detail is shown only where each musician has allowed comparison.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline md:grid-cols-3">
          <div className="bg-surface-paper p-4"><dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">Solid or Known</dt><dd className="mt-1 text-3xl font-bold">{outcomeGroups.sharedStrongIds.length}</dd></div>
          <div className="bg-surface-paper p-4"><dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">Shared, building</dt><dd className="mt-1 text-3xl font-bold">{outcomeGroups.sharedShakyIds.length}</dd></div>
          <div className="col-span-2 bg-surface-paper p-4 md:col-span-1"><dt className="text-xs font-semibold uppercase tracking-wider text-text-muted">Teaching possibilities</dt><dd className="mt-1 text-sm font-semibold">{teachCounts.map(({ name, count }) => `${name}: ${count}`).join(" · ")}</dd></div>
        </dl>
      </section>

      <aside className="workbench-context" aria-label="Suggested session">
      {playablePieces.length > 0 ? (
        <SuggestedSessionSet
          suggestedIds={outcomeGroups.suggestedSetIds}
          playablePieces={playablePieces}
          compareUsernames={filterPreservedUsers}
        />
      ) : (
        <EmptyState
          title="No overlap yet"
          description="There is nothing to score here. Add another musician or include active Practice tunes to look for a starting point."
          secondaryActionHref="/friends"
          secondaryActionLabel="Find musicians"
        />
      )}

      </aside>

      <section className="min-w-0" aria-labelledby="full-overlap-title">
        <h2 id="full-overlap-title" className="mt-1 text-xl font-semibold">Browse shared tunes</h2>
        <nav aria-label="Overlap groups" className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(["all", "strong", "shaky"] as const).map((group) => (
            <Link key={group} href={groupHref(group)} aria-current={overlapGroup === group ? "page" : undefined} className={overlapGroup === group ? "shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" : "shrink-0 rounded-full border border-hairline bg-surface-paper px-4 py-2 text-sm font-semibold text-text-muted"}>
              {group === "all" ? "All shared" : group === "strong" ? "Solid / Known" : "Still building"}
            </Link>
          ))}
        </nav>
        <div className="mt-4">
          <PieceSearchFilters
            basePath="/compare"
            searchLabel="Search shared tunes"
            searchPlaceholder="Tune title"
            searchValue={props.titleQuery}
            selectedKeys={props.selectedKeys}
            selectedStyles={props.selectedStyles}
            selectedTimeSignatures={props.selectedTimeSignatures}
            availableKeys={props.availableKeys}
            availableStyles={props.availableStyles}
            availableTimeSignatures={props.availableTimeSignatures}
            hasActiveFilters={props.hasActiveFilters}
            preservedParams={{ user: filterPreservedUsers, include_practice: includePractice ? "1" : "0", group: overlapGroup }}
          />
        </div>
        <PaginatedTuneCollection
          label="Shared tunes"
          itemCount={filteredPieces.length}
          totalCount={overlapTotal}
          previousHref={props.previousOverlapHref}
          nextHref={props.nextOverlapHref}
          emptyTitle="No shared tunes match"
          emptyDescription="Try another group or clear the filters."
          resetHref={groupHref("all")}
          resetLabel="Show all shared tunes"
          className="mt-4"
          items={filteredPieces.map((piece) => (
            <li key={piece.id}><TuneRow piece={piece} /></li>
          ))}
        />
      </section>
    </div>
  )
}

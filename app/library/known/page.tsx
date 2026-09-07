import PieceSearchFilters from "@/components/library/PieceSearchFilters"
import RepertoireTuneList from "@/components/repertoire/RepertoireTuneList"
import PageHeader from "@/components/ui/PageHeader"
import { addToLearningList } from "@/lib/actions/lists"
import {
  loadKnownTunesPageData,
  FILTER_FACET_SCAN_LIMIT as REPERTOIRE_FILTER_FACET_SCAN_LIMIT,
} from "@/lib/loaders/repertoire"
import { getPieceFilterOptions } from "@/lib/search-filters"
import { describeTuneFilterConstraints } from "@/lib/tune-collections/filter-drafts"
import type { KnownTuneGrouping } from "@/lib/tune-collections/grouping"
import {
  buildTuneCollectionHref,
  parseTuneCollectionQueryState,
} from "@/lib/tune-collections/pagination"

type SearchParamValue = string | string[] | undefined

type KnownTunesPageProps = {
  searchParams?: Promise<{
    q?: SearchParamValue
    key?: SearchParamValue
    style?: SearchParamValue
    time_signature?: SearchParamValue
    sort?: SearchParamValue
    after?: SearchParamValue
    before?: SearchParamValue
    group?: SearchParamValue
    list_add?: SearchParamValue
    remove_tune?: SearchParamValue
  }>
}

function firstParam(value: SearchParamValue) {
  if (!value) return ""
  return Array.isArray(value) ? value[0] ?? "" : value
}

function StatusMessage({
  status,
  type,
}: {
  status: string
  type: "list_add" | "remove_tune"
}) {
  if (type === "list_add" && status === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-success bg-success/10 p-4 text-sm font-medium text-muted-foreground">
        Tune added to list.
      </div>
    )
  }

  if (type === "list_add" && status === "duplicate") {
    return (
      <div className="mb-6 rounded-2xl border border-border bg-muted p-4 text-sm font-medium text-muted-foreground">
        That tune is already in this list.
      </div>
    )
  }

  if (type === "remove_tune" && status === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-success bg-success/10 p-4 text-sm font-medium text-muted-foreground">
        Tune removed from your app.
      </div>
    )
  }

  if (type === "remove_tune" && status === "missing_piece") {
    return (
      <div className="mb-6 rounded-2xl border border-warning bg-warning/20 p-4 text-sm font-medium text-warning-foreground">
        Couldn’t tell which tune to remove.
      </div>
    )
  }

  if (type === "remove_tune" && status === "error") {
    return (
      <div className="mb-6 rounded-2xl border border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive">
        Couldn’t remove tune.
      </div>
    )
  }

  return null
}

export default async function KnownTunesPage({
  searchParams,
}: KnownTunesPageProps) {
  const resolvedSearchParams = await searchParams
  const collectionState = parseTuneCollectionQueryState({
    q: resolvedSearchParams?.q,
    key: resolvedSearchParams?.key,
    style: resolvedSearchParams?.style,
    time_signature: resolvedSearchParams?.time_signature,
    sort: resolvedSearchParams?.sort,
    after: resolvedSearchParams?.after,
    before: resolvedSearchParams?.before,
  })
  const listAddStatus = firstParam(resolvedSearchParams?.list_add)
  const removeTuneStatus = firstParam(resolvedSearchParams?.remove_tune)
  const rawGroup = firstParam(resolvedSearchParams?.group)
  const groupBy: KnownTuneGrouping =
    rawGroup === "key" || rawGroup === "style" ? rawGroup : "none"

  const {
    pieces,
    totalCount,
    pageInfo,
    filterOptionPieces,
    learningLists,
    learningListItems,
  } = await loadKnownTunesPageData(collectionState)

  const stableCollectionState = {
    searchQuery: collectionState.searchQuery,
    selectedKeys: collectionState.selectedKeys,
    selectedStyles: collectionState.selectedStyles,
    selectedTimeSignatures: collectionState.selectedTimeSignatures,
    sort: collectionState.sort,
  }
  const redirectTo = buildTuneCollectionHref({
    basePath: "/library/known",
    state: stableCollectionState,
    after: collectionState.after,
    before: collectionState.before,
    preservedParams: groupBy === "none" ? {} : { group: groupBy },
  })
  const previousHref = pageInfo.previousCursor
    ? buildTuneCollectionHref({
        basePath: "/library/known",
        state: stableCollectionState,
        before: pageInfo.previousCursor,
        preservedParams: groupBy === "none" ? {} : { group: groupBy },
      })
    : null
  const nextHref = pageInfo.nextCursor
    ? buildTuneCollectionHref({
        basePath: "/library/known",
        state: stableCollectionState,
        after: pageInfo.nextCursor,
        preservedParams: groupBy === "none" ? {} : { group: groupBy },
      })
    : null
  const { keys, styles, timeSignatures } =
    getPieceFilterOptions(filterOptionPieces)
  const hasActiveFilters =
    collectionState.searchQuery !== "" ||
    collectionState.selectedKeys.length > 0 ||
    collectionState.selectedStyles.length > 0 ||
    collectionState.selectedTimeSignatures.length > 0
  const activeConstraints = describeTuneFilterConstraints({
    searchQuery: collectionState.searchQuery,
    keys: collectionState.selectedKeys,
    styles: collectionState.selectedStyles,
    timeSignatures: collectionState.selectedTimeSignatures,
  })

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <PageHeader title="Known Tunes" backHref="/library" />

      <StatusMessage status={listAddStatus} type="list_add" />
      <StatusMessage status={removeTuneStatus} type="remove_tune" />

      <PieceSearchFilters
        basePath="/library/known"
        searchLabel="Search known tunes by title"
        searchPlaceholder="Search known tunes"
        searchValue={collectionState.searchQuery}
        selectedKeys={collectionState.selectedKeys}
        selectedStyles={collectionState.selectedStyles}
        selectedTimeSignatures={collectionState.selectedTimeSignatures}
        selectedSort={collectionState.sort}
        availableKeys={keys}
        availableStyles={styles}
        availableTimeSignatures={timeSignatures}
        hasActiveFilters={hasActiveFilters}
        totalCount={totalCount}
        countItems={filterOptionPieces}
        prospectiveCountExact={
          filterOptionPieces.length < REPERTOIRE_FILTER_FACET_SCAN_LIMIT
        }
        sticky
        selectedGroup={groupBy}
        groupOptions={[
          { value: "none", label: "No grouping" },
          { value: "key", label: "Group by key" },
          { value: "style", label: "Group by style" },
        ]}
        preservedParams={groupBy === "none" ? {} : { group: groupBy }}
      />

      <RepertoireTuneList
        mode="known"
        knownItems={pieces.map((piece) => ({ piece }))}
        learningLists={learningLists}
        learningListItems={learningListItems}
        addToLearningList={addToLearningList}
        redirectTo={redirectTo}
        totalCount={totalCount}
        previousHref={previousHref}
        nextHref={nextHref}
        hasActiveFilters={hasActiveFilters}
        activeConstraints={activeConstraints}
        groupBy={groupBy}
      />
    </main>
  )
}

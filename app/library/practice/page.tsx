import PieceSearchFilters from "@/components/library/PieceSearchFilters"
import RepertoireTuneList from "@/components/repertoire/RepertoireTuneList"
import PageHeader from "@/components/ui/PageHeader"
import { addToLearningList } from "@/lib/actions/lists"
import {
  loadPracticeTunesPageData,
  FILTER_FACET_SCAN_LIMIT as REPERTOIRE_FILTER_FACET_SCAN_LIMIT,
} from "@/lib/loaders/repertoire"
import { getPieceFilterOptions } from "@/lib/search-filters"
import { describeTuneFilterConstraints } from "@/lib/tune-collections/filter-drafts"
import type { PracticeTuneGrouping } from "@/lib/tune-collections/grouping"
import {
  buildTuneCollectionHref,
  parseTuneCollectionQueryState,
} from "@/lib/tune-collections/pagination"

type SearchParamValue = string | string[] | undefined

type PracticeTunesPageProps = {
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
    remove_from_practice?: SearchParamValue
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
  type: "list_add" | "remove_from_practice"
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

  if (type === "remove_from_practice" && status === "success") {
    return (
      <div className="mb-6 rounded-2xl border border-success bg-success/10 p-4 text-sm font-medium text-muted-foreground">
        Tune removed from practice.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "missing_user_piece") {
    return (
      <div className="mb-6 rounded-2xl border border-warning bg-warning/20 p-4 text-sm font-medium text-warning-foreground">
        Couldn’t tell which practice tune to remove.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "not_found") {
    return (
      <div className="mb-6 rounded-2xl border border-warning bg-warning/20 p-4 text-sm font-medium text-warning-foreground">
        That practice tune could not be found.
      </div>
    )
  }

  if (type === "remove_from_practice" && status === "error") {
    return (
      <div className="mb-6 rounded-2xl border border-destructive bg-destructive/10 p-4 text-sm font-medium text-destructive">
        Couldn’t remove tune from practice.
      </div>
    )
  }

  return null
}

export default async function PracticeTunesPage({
  searchParams,
}: PracticeTunesPageProps) {
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
  const removeFromPracticeStatus =
    firstParam(resolvedSearchParams?.remove_from_practice)
  const rawGroup = firstParam(resolvedSearchParams?.group)
  const groupBy: PracticeTuneGrouping = ["due", "stage", "key", "style"].includes(
    rawGroup
  )
    ? (rawGroup as PracticeTuneGrouping)
    : "none"

  const {
    practiceItems,
    totalCount,
    pageInfo,
    filterOptionPieces,
    learningLists,
    learningListItems,
  } = await loadPracticeTunesPageData(collectionState)

  const stableCollectionState = {
    searchQuery: collectionState.searchQuery,
    selectedKeys: collectionState.selectedKeys,
    selectedStyles: collectionState.selectedStyles,
    selectedTimeSignatures: collectionState.selectedTimeSignatures,
    sort: collectionState.sort,
  }
  const redirectTo = buildTuneCollectionHref({
    basePath: "/library/practice",
    state: stableCollectionState,
    after: collectionState.after,
    before: collectionState.before,
    preservedParams: groupBy === "none" ? {} : { group: groupBy },
  })
  const previousHref = pageInfo.previousCursor
    ? buildTuneCollectionHref({
        basePath: "/library/practice",
        state: stableCollectionState,
        before: pageInfo.previousCursor,
        preservedParams: groupBy === "none" ? {} : { group: groupBy },
      })
    : null
  const nextHref = pageInfo.nextCursor
    ? buildTuneCollectionHref({
        basePath: "/library/practice",
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
      <PageHeader title="Practice Tunes" backHref="/library" />

      <StatusMessage status={listAddStatus} type="list_add" />
      <StatusMessage
        status={removeFromPracticeStatus}
        type="remove_from_practice"
      />

      <PieceSearchFilters
        basePath="/library/practice"
        searchLabel="Search practice tunes by title"
        searchPlaceholder="Search practice tunes"
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
          { value: "due", label: "Group by due" },
          { value: "stage", label: "Group by Stage" },
          { value: "key", label: "Group by key" },
          { value: "style", label: "Group by style" },
        ]}
        preservedParams={groupBy === "none" ? {} : { group: groupBy }}
      />

      <RepertoireTuneList
        mode="practice"
        practiceItems={practiceItems}
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

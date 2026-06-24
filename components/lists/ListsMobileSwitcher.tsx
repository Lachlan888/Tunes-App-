"use client"

import Link from "next/link"
import { useState } from "react"
import EmptyState from "@/components/EmptyState"
import BookmarkedSharedListsModal from "@/components/lists/BookmarkedSharedListsModal"
import CreateListModal from "@/components/lists/CreateListModal"
import DirectSharedListsSection from "@/components/lists/DirectSharedListsSection"
import LearningQueueModal from "@/components/lists/LearningQueueModal"
import ListOverviewCard from "@/components/lists/ListOverviewCard"
import ListSearchFilters from "@/components/lists/ListSearchFilters"
import ListsStatusMessages from "@/components/lists/ListsStatusMessages"
import UnlistedKnownTunesModal from "@/components/lists/UnlistedKnownTunesModal"
import UnlistedPracticeTunesModal from "@/components/lists/UnlistedPracticeTunesModal"
import { joinClasses } from "@/components/ui/buttonStyles"
import type {
  BookmarkedSharedListSummary,
  DirectSharedListSummary,
  LearningQueueTune,
} from "@/lib/loaders/lists"
import type {
  FilterableLearningList,
  LearningList,
  MyTuneRow,
  UserKnownPieceWithPiece,
  UserPieceWithPiece,
} from "@/lib/types"

type ListsMobileTab = "overview" | "lists" | "cleanup"

type ListsMobileSwitcherProps = {
  userEmail: string | null | undefined
  myTunes: MyTuneRow[]
  learningQueueTunes: LearningQueueTune[]
  bookmarkedSharedLists: BookmarkedSharedListSummary[]
  directSharedLists: DirectSharedListSummary[]
  unlistedPracticeTunes: UserPieceWithPiece[]
  unlistedKnownTunes: UserKnownPieceWithPiece[]
  learningLists: LearningList[]
  listOverviews: FilterableLearningList[]
  filteredListOverviews: FilterableLearningList[]
  availableStyles: string[]
  searchQuery: string
  selectedSize: string
  selectedStyles: string[]
  selectedSource: string
  selectedVisibility: string
  hasActiveFilters: boolean
  createListStatus: string
  editListStatus: string
  showCreateList: boolean
  showSummaryGrid: boolean
  showFilters: boolean
  showResultsHeader: boolean
  showListResults: boolean
  redirectTo: string
  addToLearningList: (formData: FormData) => Promise<void>
  startLearning: (formData: FormData) => Promise<void>
  unbookmarkPublicList: (formData: FormData) => Promise<void>
  updateList: (formData: FormData) => Promise<void>
  removeTuneFromList: (formData: FormData) => Promise<void>
  deleteList: (formData: FormData) => Promise<void>
}

const tabs: { id: ListsMobileTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "lists", label: "Lists" },
  { id: "cleanup", label: "Cleanup" },
]

const mobileSummaryClassName =
  "py-4 border-b border-border/70"

const compactActionClassName =
  "shrink-0 rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

function MobileSwitcher({
  activeTab,
  onChange,
}: {
  activeTab: ListsMobileTab
  onChange: (tab: ListsMobileTab) => void
}) {
  return (
    <div className="-mx-4 px-4 py-3">
      <div className="grid grid-cols-3 rounded-full border border-border bg-card-strong/70 p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={joinClasses(
                "rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CountRows({
  myTunesCount,
  learningQueueCount,
  listsCount,
  onSelectTab,
}: {
  myTunesCount: number
  learningQueueCount: number
  listsCount: number
  onSelectTab: (tab: ListsMobileTab) => void
}) {
  const rows = [
    {
      label: "My Tunes",
      value: myTunesCount,
      hint: "Open library",
      href: "/library",
    },
    {
      label: "Learning Queue",
      value: learningQueueCount,
      hint: "Review cleanup",
      onClick: () => onSelectTab("cleanup"),
    },
    {
      label: "Lists",
      value: listsCount,
      hint: "Browse lists",
      onClick: () => onSelectTab("lists"),
    },
  ]

  return (
    <div className="divide-y divide-border/70">
      {rows.map((row) => {
        const content = (
          <>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {row.label}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {row.hint} <span aria-hidden="true">›</span>
              </p>
            </div>

            <p className="font-serif text-3xl font-bold leading-none text-foreground">
              {row.value}
            </p>
          </>
        )

        if (row.href) {
          return (
            <Link
              key={row.label}
              href={row.href}
              className="flex items-center justify-between gap-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {content}
            </Link>
          )
        }

        return (
          <button
            key={row.label}
            type="button"
            onClick={row.onClick}
            className="flex w-full items-center justify-between gap-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}

function OverviewTab({
  userEmail,
  myTunes,
  learningQueueTunes,
  bookmarkedSharedLists,
  directSharedLists,
  learningLists,
  unbookmarkPublicList,
  showCreateList,
  showSummaryGrid,
  redirectTo,
  onSelectTab,
}: Pick<
  ListsMobileSwitcherProps,
  | "userEmail"
  | "myTunes"
  | "learningQueueTunes"
  | "bookmarkedSharedLists"
  | "directSharedLists"
  | "learningLists"
  | "unbookmarkPublicList"
  | "showCreateList"
  | "showSummaryGrid"
  | "redirectTo"
> & {
  onSelectTab: (tab: ListsMobileTab) => void
}) {
  return (
    <div className="space-y-5">
      <section className="pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Lists
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground">
          Organise tunes
        </h1>
        {userEmail ? (
          <p className="mt-2 truncate text-sm text-muted-foreground">
            Signed in as {userEmail}
          </p>
        ) : null}

        {showCreateList ? (
          <div className="mt-4">
            <CreateListModal />
          </div>
        ) : null}
      </section>

      {showSummaryGrid ? (
        <section>
          <div className="divide-y divide-border/70 border-y border-border/70">
            <CountRows
              myTunesCount={myTunes.length}
              learningQueueCount={learningQueueTunes.length}
              listsCount={learningLists.length}
              onSelectTab={onSelectTab}
            />

            <BookmarkedSharedListsModal
              bookmarkedSharedLists={bookmarkedSharedLists}
              unbookmarkPublicList={unbookmarkPublicList}
              redirectTo={redirectTo}
              summaryClassName=""
              summaryVariant="compact"
              triggerClassName={compactActionClassName}
            />
          </div>

          <DirectSharedListsSection
            directSharedLists={directSharedLists}
            className="mt-5"
          />
        </section>
      ) : null}
    </div>
  )
}

function ListsTab({
  listOverviews,
  filteredListOverviews,
  availableStyles,
  searchQuery,
  selectedSize,
  selectedStyles,
  selectedSource,
  selectedVisibility,
  hasActiveFilters,
  showFilters,
  showResultsHeader,
  showListResults,
  redirectTo,
  updateList,
  removeTuneFromList,
  deleteList,
}: Pick<
  ListsMobileSwitcherProps,
  | "listOverviews"
  | "filteredListOverviews"
  | "availableStyles"
  | "searchQuery"
  | "selectedSize"
  | "selectedStyles"
  | "selectedSource"
  | "selectedVisibility"
  | "hasActiveFilters"
  | "showFilters"
  | "showResultsHeader"
  | "showListResults"
  | "redirectTo"
  | "updateList"
  | "removeTuneFromList"
  | "deleteList"
>) {
  return (
    <div className="space-y-5">
      {listOverviews.length > 0 && showFilters ? (
        <ListSearchFilters
          basePath="/learning-lists"
          searchLabel="Search by list name"
          searchPlaceholder="Search lists"
          searchValue={searchQuery}
          selectedSize={selectedSize}
          selectedStyles={selectedStyles}
          selectedSource={selectedSource}
          selectedVisibility={selectedVisibility}
          availableStyles={availableStyles}
          hasActiveFilters={hasActiveFilters}
        />
      ) : null}

      {listOverviews.length > 0 && showResultsHeader ? (
        <section className="flex flex-wrap items-center justify-between gap-3 border-y border-border/70 py-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Your lists
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Editable lists you created or copied. Showing{" "}
              {filteredListOverviews.length} of {listOverviews.length}
            </p>
          </div>

          {hasActiveFilters ? (
            <a
              href="/learning-lists"
              className="rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              Reset
            </a>
          ) : null}
        </section>
      ) : null}

      {showListResults ? (
        listOverviews.length === 0 ? (
          <EmptyState
            title="No lists yet"
            description="Use Create List from Overview to start one."
            secondaryActionHref="/library"
            secondaryActionLabel="Browse Tunes"
          />
        ) : filteredListOverviews.length === 0 ? (
          <EmptyState
            title="No lists match this view"
            description="Try clearing the search or filters."
            primaryActionHref="/learning-lists"
            primaryActionLabel="Reset view"
          />
        ) : (
          <div className="divide-y divide-border/70">
            {filteredListOverviews.map((list) => (
              <ListOverviewCard
                key={list.id}
                list={list}
                redirectTo={redirectTo}
                updateList={updateList}
                removeTuneFromList={removeTuneFromList}
                deleteList={deleteList}
              />
            ))}
          </div>
        )
      ) : null}
    </div>
  )
}

function CleanupTab({
  learningQueueTunes,
  unlistedPracticeTunes,
  unlistedKnownTunes,
  learningLists,
  addToLearningList,
  startLearning,
  redirectTo,
  showSummaryGrid,
}: Pick<
  ListsMobileSwitcherProps,
  | "learningQueueTunes"
  | "unlistedPracticeTunes"
  | "unlistedKnownTunes"
  | "learningLists"
  | "addToLearningList"
  | "startLearning"
  | "redirectTo"
  | "showSummaryGrid"
>) {
  if (!showSummaryGrid) {
    return null
  }

  const hasCleanup =
    learningQueueTunes.length > 0 ||
    unlistedPracticeTunes.length > 0 ||
    unlistedKnownTunes.length > 0

  return (
    <div>
      <section className="border-b border-border/70 pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Cleanup
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review saved-for-later tunes and organise unlisted practice or known
          tunes.
        </p>
      </section>

      {hasCleanup ? (
        <div className="divide-y divide-border/70">
          <LearningQueueModal
            learningQueueTunes={learningQueueTunes}
            startLearning={startLearning}
            redirectTo={redirectTo}
            summaryClassName={mobileSummaryClassName}
            summaryVariant="compact"
            triggerClassName={compactActionClassName}
          />

          <UnlistedPracticeTunesModal
            unlistedPracticeTunes={unlistedPracticeTunes}
            learningLists={learningLists}
            addToLearningList={addToLearningList}
            redirectTo={redirectTo}
            summaryClassName={mobileSummaryClassName}
            summaryVariant="compact"
            triggerClassName={compactActionClassName}
          />

          <UnlistedKnownTunesModal
            unlistedKnownTunes={unlistedKnownTunes}
            learningLists={learningLists}
            addToLearningList={addToLearningList}
            redirectTo={redirectTo}
            summaryClassName={mobileSummaryClassName}
            summaryVariant="compact"
            triggerClassName={compactActionClassName}
          />
        </div>
      ) : (
        <EmptyState
          title="Nothing to clean up"
          description="Learning queue and unlisted tune prompts will appear here."
          className="mt-4"
        />
      )}
    </div>
  )
}

export default function ListsMobileSwitcher(props: ListsMobileSwitcherProps) {
  const [activeTab, setActiveTab] = useState<ListsMobileTab>("overview")

  return (
    <section className="space-y-3 md:hidden">
      <MobileSwitcher activeTab={activeTab} onChange={setActiveTab} />

      <ListsStatusMessages
        createListStatus={props.createListStatus}
        editListStatus={props.editListStatus}
      />

      {activeTab === "overview" ? (
        <OverviewTab {...props} onSelectTab={setActiveTab} />
      ) : null}
      {activeTab === "lists" ? <ListsTab {...props} /> : null}
      {activeTab === "cleanup" ? <CleanupTab {...props} /> : null}
    </section>
  )
}

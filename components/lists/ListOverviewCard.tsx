"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import EditListModal from "@/components/lists/EditListModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { cardStyles } from "@/components/ui/cardStyles"
import type { FilterableLearningList } from "@/lib/types"

type ListOverviewCardProps = {
  list: FilterableLearningList
  redirectTo: string
  updateList: (formData: FormData) => Promise<void>
  removeTuneFromList: (formData: FormData) => Promise<void>
  deleteList: (formData: FormData) => Promise<void>
}

export default function ListOverviewCard({
  list,
  redirectTo,
  updateList,
  removeTuneFromList,
  deleteList,
}: ListOverviewCardProps) {
  const visibilityLabel = list.visibility === "public" ? "Public" : "Private"
  const listHref = `/learning-lists/${list.id}`
  const compactButtonClassName =
    "inline-flex min-h-9 items-center justify-center rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

  return (
    <article className="border-b border-border/70 py-5 last:border-b-0 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3 md:block">
          <h2 className="min-w-0 text-lg font-semibold leading-tight text-foreground md:font-serif md:text-2xl md:font-bold">
            <PendingLinkButton href={listHref} label={list.name} pendingLabel="Loading..." className="decoration-primary decoration-2 underline-offset-4 hover:underline" />
          </h2>
          <span className="shrink-0 text-sm font-medium text-muted-foreground md:hidden">{list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}</span>
        </div>
        {list.description ? <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">{list.description}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span className={cardStyles.statusBadge}>{visibilityLabel}</span>
          {list.is_imported ? <span>Your editable copy</span> : null}
          {list.stylesPresent.slice(0, 3).map((style) => <span key={style}>{style}</span>)}
          {list.stylesPresent.length > 3 ? <span>+{list.stylesPresent.length - 3} styles</span> : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 md:mt-0 md:justify-end">
        <span className="mr-2 hidden text-sm text-muted-foreground md:inline">{list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}</span>
        <PendingLinkButton href={listHref} label="Read" pendingLabel="Opening..." className={buttonStyles.primary} />
        <EditListModal listId={list.id} name={list.name} description={list.description} visibility={list.visibility} redirectTo={redirectTo} tunes={list.tunes} updateList={updateList} removeTuneFromList={removeTuneFromList} deleteList={deleteList} triggerLabel="Manage" triggerClassName={compactButtonClassName} />
      </div>
    </article>
  )
}

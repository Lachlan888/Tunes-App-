"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import EditListModal from "@/components/lists/EditListModal"
import ClickableCard from "@/components/ui/ClickableCard"
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
    <>
      <section className="py-4 md:hidden">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 text-lg font-semibold leading-tight text-foreground">
              <PendingLinkButton
                href={listHref}
                label={list.name}
                pendingLabel="Loading..."
                className="decoration-primary decoration-2 underline-offset-4 hover:underline"
              />
            </h2>

            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
            </span>
          </div>

          {list.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {list.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={cardStyles.statusBadge}>{visibilityLabel}</span>
            {list.is_imported ? <span>Your editable copy</span> : null}
            {list.stylesPresent.slice(0, 3).map((style) => (
              <span key={style}>{style}</span>
            ))}
            {list.stylesPresent.length > 3 ? (
              <span>+{list.stylesPresent.length - 3} styles</span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <PendingLinkButton
              href={listHref}
              label="Open"
              pendingLabel="Opening..."
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-primary bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />

            <EditListModal
              listId={list.id}
              name={list.name}
              description={list.description}
              visibility={list.visibility}
              redirectTo={redirectTo}
              tunes={list.tunes}
              updateList={updateList}
              removeTuneFromList={removeTuneFromList}
              deleteList={deleteList}
              triggerLabel="Manage"
              triggerClassName={compactButtonClassName}
            />
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <ClickableCard
          href={listHref}
          ariaLabel={`Open list ${list.name}`}
          as="section"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl font-bold leading-tight text-foreground">
                <PendingLinkButton
                  href={listHref}
                  label={list.name}
                  pendingLabel="Loading..."
                  className="decoration-primary decoration-2 underline-offset-4 hover:underline"
                />
              </h2>

              {list.description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {list.description}
                </p>
              )}

              <div data-card-action className="mt-4 flex flex-wrap items-center gap-3">
                <PendingLinkButton
                  href={listHref}
                  label="View List"
                  pendingLabel="Loading..."
                  className={buttonStyles.primary}
                />

                <div data-card-action>
                  <EditListModal
                    listId={list.id}
                    name={list.name}
                    description={list.description}
                    visibility={list.visibility}
                    redirectTo={redirectTo}
                    tunes={list.tunes}
                    updateList={updateList}
                    removeTuneFromList={removeTuneFromList}
                    deleteList={deleteList}
                    triggerLabel="Manage List"
                  />
                </div>
              </div>

              {list.stylesPresent.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Styles included
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {list.stylesPresent.map((style) => (
                      <span key={style} className={cardStyles.statusBadge}>
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 text-right text-sm text-muted-foreground">
              <div className={cardStyles.statusBadge}>{visibilityLabel}</div>

              {list.is_imported && (
                <div className="mt-2">Your editable copy</div>
              )}

              <div className="mt-2">
                {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        </ClickableCard>
      </div>
    </>
  )
}

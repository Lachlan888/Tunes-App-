import PendingLinkButton from "@/components/PendingLinkButton"
import EditListModal from "@/components/lists/EditListModal"
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

  return (
    <section className="rounded-2xl border border-border bg-background/70 p-5 shadow-sm transition hover:bg-muted/70">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl font-bold leading-tight text-foreground">
            {list.name}
          </h2>

          {list.description && (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {list.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <PendingLinkButton
              href={`/learning-lists/${list.id}`}
              label="View List"
              pendingLabel="Loading..."
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
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
              triggerLabel="Manage List"
            />
          </div>

          {list.stylesPresent.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Styles included
              </p>

              <div className="flex flex-wrap gap-2">
                {list.stylesPresent.map((style) => (
                  <span
                    key={style}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 text-right text-sm text-muted-foreground">
          <div className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium">
            {visibilityLabel}
          </div>

          {list.is_imported && <div className="mt-2">Imported</div>}

          <div className="mt-2">
            {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </section>
  )
}
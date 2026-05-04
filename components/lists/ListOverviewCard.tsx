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
  return (
    <section className="rounded border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">{list.name}</h2>

          {list.description && (
            <p className="mt-2 text-gray-600">{list.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <PendingLinkButton
              href={`/learning-lists/${list.id}`}
              label="View List"
              pendingLabel="Loading..."
              className="text-sm underline"
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
            <div className="mt-3 flex flex-wrap gap-2">
              {list.stylesPresent.map((style) => (
                <span
                  key={style}
                  className="rounded-full border px-2 py-1 text-xs text-gray-700"
                >
                  {style}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <div className="text-sm text-gray-500">
            {list.visibility === "public" ? "Public" : "Private"}
          </div>

          {list.is_imported && (
            <div className="mt-1 text-sm text-gray-500">Imported</div>
          )}

          <div className="mt-1 text-sm text-gray-500">
            {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    </section>
  )
}
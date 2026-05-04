import SharedListCard from "@/components/shared/SharedListCard"
import SharedListsEmptyState from "@/components/shared/SharedListsEmptyState"
import SharedListsErrorState from "@/components/shared/SharedListsErrorState"
import SharedListsHeader from "@/components/shared/SharedListsHeader"
import { loadPublicListsData } from "@/lib/loaders/public-lists"

export default async function PublicListsPage() {
  const publicListsData = await loadPublicListsData()

  if (publicListsData.status === "error") {
    return <SharedListsErrorState message={publicListsData.message} />
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <SharedListsHeader />

      {publicListsData.sharedLists.length === 0 ? (
        <SharedListsEmptyState />
      ) : (
        <div className="space-y-4">
          {publicListsData.sharedLists.map((list) => (
            <SharedListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </main>
  )
}
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
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <SharedListsHeader />

      {publicListsData.sharedLists.length === 0 ? (
        <SharedListsEmptyState />
      ) : (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Public lists
          </h2>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {publicListsData.sharedLists.map((list) => (
              <SharedListCard key={list.id} list={list} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
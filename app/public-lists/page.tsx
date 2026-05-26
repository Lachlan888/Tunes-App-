import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import SharedListCard from "@/components/shared/SharedListCard"
import SharedListsEmptyState from "@/components/shared/SharedListsEmptyState"
import SharedListsErrorState from "@/components/shared/SharedListsErrorState"
import SharedListsHeader from "@/components/shared/SharedListsHeader"
import SharedListsMobileList from "@/components/shared/SharedListsMobileList"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { loadPublicListsData } from "@/lib/loaders/public-lists"
import { SHARED_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"

type PublicListsPageProps = {
  searchParams?: Promise<{
    page_options?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getPageOptionsMessage(status: string) {
  if (status === "saved") return "Public Lists page options saved."
  if (status === "reset") return "Public Lists page options reset."
  if (status === "error") return "Could not save Public Lists page options."

  return null
}

export default async function PublicListsPage({
  searchParams,
}: PublicListsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const pagePreferences = await loadPagePreferences(
    SHARED_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const pageOptionsMessage = getPageOptionsMessage(
    getSingleValue(resolvedSearchParams?.page_options)
  )

  const publicListsData = await loadPublicListsData()

  if (publicListsData.status === "error") {
    return <SharedListsErrorState message={publicListsData.message} />
  }

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      {pageOptionsMessage ? (
        <div className="mb-5 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {pageOptionsMessage}
        </div>
      ) : null}

      <section className="mb-8 hidden flex-wrap items-center justify-end gap-3 md:flex">
        <PageOptionsModal
          config={SHARED_PAGE_OPTIONS_CONFIG}
          preferences={pagePreferences}
          redirectTo="/public-lists"
        />
      </section>

      {showSection("shared_header") ? <SharedListsHeader /> : null}

      {publicListsData.sharedLists.length === 0 ? (
        showSection("empty_state") ? (
          <SharedListsEmptyState />
        ) : null
      ) : showSection("public_lists") ? (
        <>
          <SharedListsMobileList lists={publicListsData.sharedLists} />

          <section className="hidden rounded-3xl border border-border bg-card p-6 shadow-sm md:block">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Public lists
            </h2>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {publicListsData.sharedLists.map((list) => (
                <SharedListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </main>
  )
}

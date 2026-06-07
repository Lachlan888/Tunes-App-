import Link from "next/link"
import BadgeBrowser from "@/components/badges/BadgeBrowser"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import { loadBadgeIndexData } from "@/lib/loaders/badges"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { BADGES_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"

type BadgesPageProps = {
  searchParams?: Promise<{
    create_badge?: string | string[]
    delete_badge?: string | string[]
    page_options?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getPageMessage({
  createStatus,
  deleteStatus,
  pageOptionsStatus,
}: {
  createStatus: string
  deleteStatus: string
  pageOptionsStatus: string
}) {
  if (createStatus === "success") return "Badge created."
  if (deleteStatus === "success") return "Badge deleted."
  if (deleteStatus === "not_found") return "Badge was already gone."
  if (deleteStatus === "error") return "Couldn’t delete badge."

  if (pageOptionsStatus === "saved") return "Badges display options saved."
  if (pageOptionsStatus === "reset") return "Badges display options reset."
  if (pageOptionsStatus === "error") return "Couldn’t save display options."

  return null
}

export const dynamic = "force-dynamic"

export default async function BadgesPage({ searchParams }: BadgesPageProps) {
  const { badges, viewerId } = await loadBadgeIndexData()
  const pagePreferences = await loadPagePreferences(
    BADGES_PAGE_OPTIONS_CONFIG.pageKey
  )
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const message = getPageMessage({
    createStatus: getSingleValue(resolvedSearchParams?.create_badge),
    deleteStatus: getSingleValue(resolvedSearchParams?.delete_badge),
    pageOptionsStatus: getSingleValue(resolvedSearchParams?.page_options),
  })

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      {message && showSection("status_messages") ? (
        <div className="mb-5 rounded-2xl border border-success bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-border bg-card px-5 py-5 text-center shadow-sm md:p-6 md:text-left">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold leading-none tracking-tight text-foreground md:text-5xl">
              Badges
            </h1>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-end">
            {showSection("create_badge") ? (
              viewerId ? (
                <Link
                  href="/badges/new"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-primary bg-primary px-5 py-2 text-center text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:min-h-11 md:w-auto md:py-2.5"
                >
                  Create Badge
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-border px-5 py-2 text-center text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:min-h-11 md:w-auto md:py-2.5"
                >
                  Log in to create badges
                </Link>
              )
            ) : null}

            <div className="hidden md:block">
              <PageOptionsModal
                config={BADGES_PAGE_OPTIONS_CONFIG}
                preferences={pagePreferences}
                redirectTo="/badges"
              />
            </div>
          </div>
        </div>
      </section>

      {badges.length > 0 ? (
        showSection("badge_browser") ? (
          <BadgeBrowser badges={badges} viewerId={viewerId} />
        ) : null
      ) : showSection("empty_state") ? (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            No badges yet
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Create the first badge. A good starting point is a repertoire badge
            based on a public list, such as Monroe Mayhem.
          </p>
        </section>
      ) : null}
    </main>
  )
}

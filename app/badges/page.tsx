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
  if (deleteStatus === "error") return "Could not delete badge."

  if (pageOptionsStatus === "saved") return "Badges page options saved."
  if (pageOptionsStatus === "reset") return "Badges page options reset."
  if (pageOptionsStatus === "error") return "Could not save Badges page options."

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
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {message && showSection("status_messages") ? (
        <div className="mb-6 rounded-2xl border border-success bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Social
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Badges
            </h1>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Badges are user-awarded recognition objects. Browse repertoire,
              media, lore, and catalogue badges, then filter by the musical
              conditions they mention.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showSection("create_badge") ? (
              viewerId ? (
                <Link
                  href="/badges/new"
                  className="rounded-full border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  Create Badge
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                >
                  Log in to create badges
                </Link>
              )
            ) : null}

            <PageOptionsModal
              config={BADGES_PAGE_OPTIONS_CONFIG}
              preferences={pagePreferences}
              redirectTo="/badges"
            />
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
            Create the first public badge to start turning community values into
            visible recognition. A good first test is a repertoire badge based
            on a public list, such as Monroe Mayhem.
          </p>
        </section>
      ) : null}
    </main>
  )
}
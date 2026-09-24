import Link from "next/link"
import BadgeAwardMoment from "@/components/badges/BadgeAwardMoment"
import BadgeBrowser from "@/components/badges/BadgeBrowser"
import PageHeader from "@/components/ui/PageHeader"
import { loadBadgeIndexData } from "@/lib/loaders/badges"

type BadgesPageProps = {
  searchParams?: Promise<{
    create_badge?: string | string[]
    delete_badge?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getPageMessage({
  createStatus,
  deleteStatus,
}: {
  createStatus: string
  deleteStatus: string
}) {
  if (createStatus === "success") return "Badge created."
  if (deleteStatus === "success") return "Badge deleted."
  if (deleteStatus === "not_found") return "Badge was already gone."
  if (deleteStatus === "confirmation_required") return "Review and confirm the badge deletion first."
  if (deleteStatus === "error") return "Couldn’t delete badge."

  return null
}

export const dynamic = "force-dynamic"

export default async function BadgesPage({ searchParams }: BadgesPageProps) {
  const { badges, viewerId } = await loadBadgeIndexData()
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const showSection = (sectionId: string) => {
    void sectionId
    return true
  }

  const message = getPageMessage({
    createStatus: getSingleValue(resolvedSearchParams?.create_badge),
    deleteStatus: getSingleValue(resolvedSearchParams?.delete_badge),
  })

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      {message && showSection("status_messages") ? (
        <div className="mb-5 rounded-2xl border border-success bg-card p-4 text-sm font-medium text-foreground shadow-sm md:mb-6">
          {message}
        </div>
      ) : null}

      <PageHeader
        title="Badges"
        actions={
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:justify-end">
            {showSection("create_badge") ? (
              viewerId ? (
                <Link
                  href="/badges/new"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-border bg-surface-paper px-5 py-2 text-center text-sm font-medium text-state-social shadow-sm transition hover:-translate-y-0.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:min-h-11 md:w-auto md:py-2.5"
                >
                  Create badge · workspace
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-border px-5 py-2 text-center text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] md:min-h-11 md:w-auto md:py-2.5"
                >
                  Log in to create badges
                </Link>
              )
            ) : null}

          </div>
        }
      />

      <p className="max-w-2xl text-sm text-muted-foreground">Small tokens of a musical life: the tunes you carry, the stories you keep, and the company you make.</p>
      <BadgeAwardMoment badges={badges} viewerId={viewerId} />
      {badges.length > 0 ? (
        showSection("badge_browser") ? (
          <BadgeBrowser badges={badges} viewerId={viewerId} />
        ) : null
      ) : showSection("empty_state") ? (
        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            No badges yet
          </h2>
        </section>
      ) : null}
    </main>
  )
}

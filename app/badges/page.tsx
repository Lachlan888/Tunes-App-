import Link from "next/link"
import BadgeBrowser from "@/components/badges/BadgeBrowser"
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
  if (deleteStatus === "error") return "Could not delete badge."

  return null
}

export const dynamic = "force-dynamic"

export default async function BadgesPage({ searchParams }: BadgesPageProps) {
  const { badges, viewerId } = await loadBadgeIndexData()
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const message = getPageMessage({
    createStatus: getSingleValue(resolvedSearchParams?.create_badge),
    deleteStatus: getSingleValue(resolvedSearchParams?.delete_badge),
  })

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {message ? (
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

          {viewerId ? (
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
          )}
        </div>
      </section>

      {badges.length > 0 ? (
        <BadgeBrowser badges={badges} viewerId={viewerId} />
      ) : (
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
      )}
    </main>
  )
}
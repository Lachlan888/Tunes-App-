import Link from "next/link"
import { notFound } from "next/navigation"
import BadgeDetailView from "@/components/badges/BadgeDetailView"
import { loadBadgeDetailData } from "@/lib/loaders/badges"

type BadgeDetailPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{
    create_badge?: string | string[]
    update_badge?: string | string[]
    delete_badge?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getPageMessage({
  createStatus,
  updateStatus,
  deleteStatus,
}: {
  createStatus: string
  updateStatus: string
  deleteStatus: string
}) {
  if (createStatus === "success") return "Badge created."
  if (updateStatus === "success") return "Badge updated."
  if (updateStatus === "not_owner") return "Only the badge creator can edit this badge."
  if (deleteStatus === "not_owner") return "Only the badge creator can delete this badge."
  if (deleteStatus === "error") return "Couldn’t delete badge."

  return null
}

export const dynamic = "force-dynamic"

export default async function BadgeDetailPage({
  params,
  searchParams,
}: BadgeDetailPageProps) {
  const { slug } = await params
  const data = await loadBadgeDetailData(slug)

  if (data.status === "not_found") {
    notFound()
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const message = getPageMessage({
    createStatus: getSingleValue(resolvedSearchParams?.create_badge),
    updateStatus: getSingleValue(resolvedSearchParams?.update_badge),
    deleteStatus: getSingleValue(resolvedSearchParams?.delete_badge),
  })

  const viewerIsOwner =
    data.viewerId !== null && data.viewerId === data.badge.owner_user_id

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-6 text-foreground md:px-6 md:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/badges"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Badges
        </Link>

        {viewerIsOwner ? (
          <Link
            href={`/badges/${encodeURIComponent(data.badge.slug)}/edit`}
            className="inline-flex min-h-11 rounded-control border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] items-center justify-center"
          >
            Edit badge · workspace
          </Link>
        ) : null}
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-success bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {message}
        </div>
      ) : null}

      <BadgeDetailView data={data} />
    </main>
  )
}

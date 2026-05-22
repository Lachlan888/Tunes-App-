import Link from "next/link"
import { notFound } from "next/navigation"
import BadgeConditionSummary from "@/components/badges/BadgeConditionSummary"
import BadgeProgressSummary from "@/components/badges/BadgeProgressSummary"
import BadgeRecipientsList from "@/components/badges/BadgeRecipientsList"
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

function titleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function profileName(profile: {
  username: string | null
  display_name: string | null
} | null) {
  return profile?.display_name || profile?.username || "Unknown user"
}

function profileHref(profile: { username: string | null } | null) {
  return profile?.username ? `/users/${encodeURIComponent(profile.username)}` : null
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
  if (deleteStatus === "error") return "Could not delete badge."

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

  const ownerHref = profileHref(data.badge.owner_profile)
  const ownerName = profileName(data.badge.owner_profile)
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
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            Edit badge
          </Link>
        ) : null}
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-success bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {message}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {titleCase(data.badge.category)} badge
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
              {data.badge.name}
            </h1>

            <p className="mt-4 text-sm text-muted-foreground">
              Awarded by{" "}
              {ownerHref ? (
                <Link
                  href={ownerHref}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {ownerName}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{ownerName}</span>
              )}
            </p>

            {data.badge.description ? (
              <p className="mt-6 max-w-3xl text-base leading-7 text-foreground">
                {data.badge.description}
              </p>
            ) : null}
          </section>

          <BadgeConditionSummary summary={data.badge.condition_summary} />

          <BadgeRecipientsList awards={data.awards} />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <BadgeProgressSummary
            viewerAward={data.badge.viewer_award}
            progress={data.badge.viewer_progress}
          />

          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Awarding model
            </h2>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This badge is public. The condition was created by {ownerName}.
              When a user meets the condition, the badge is attributed to{" "}
              {ownerName}.
            </p>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-muted-foreground">Visibility</dt>
                <dd className="font-medium text-foreground">Public</dd>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-muted-foreground">Awarding</dt>
                <dd className="font-medium text-foreground">
                  Automatic when eligible
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-3">
                <dt className="text-muted-foreground">Recipients</dt>
                <dd className="font-medium text-foreground">
                  {data.badge.recipient_count}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </main>
  )
}
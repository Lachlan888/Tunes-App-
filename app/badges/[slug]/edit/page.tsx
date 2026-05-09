import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import CreateBadgeForm from "@/components/badges/CreateBadgeForm"
import { loadEditBadgeData } from "@/lib/loaders/badges"

type EditBadgePageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{
    update_badge?: string | string[]
    delete_badge?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getUpdateBadgeMessage(status: string) {
  if (status === "missing_name") return "Badge name is required."
  if (status === "missing_description") {
    return "Add a short description explaining what this badge rewards."
  }
  if (status === "invalid_category") return "Choose a valid badge type."
  if (status === "invalid_condition") {
    return "Choose a condition type and complete the matching condition fields."
  }
  if (status === "condition_locked") {
    return "This badge has already been awarded, so its unlock condition cannot be changed."
  }
  if (status === "error") return "Could not update badge."

  return null
}

export const dynamic = "force-dynamic"

export default async function EditBadgePage({
  params,
  searchParams,
}: EditBadgePageProps) {
  const { slug } = await params

  let data

  try {
    data = await loadEditBadgeData(slug)
  } catch {
    redirect("/login")
  }

  if (data.status === "not_found") {
    notFound()
  }

  if (data.status === "not_owner") {
    redirect(`/badges/${encodeURIComponent(slug)}?update_badge=not_owner`)
  }

  if (data.status !== "loaded" || !data.badge) {
    notFound()
  }

  const badge = data.badge

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const status = getSingleValue(resolvedSearchParams?.update_badge)
  const message = getUpdateBadgeMessage(status)

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <div className="mb-5">
        <Link
          href={`/badges/${encodeURIComponent(badge.slug)}`}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Badge
        </Link>
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-warning bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Badges
        </p>

        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Edit Badge
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
          Update the public wording for this badge. If the badge has not been
          awarded yet, you can also change its unlock condition.
        </p>
      </section>

      <CreateBadgeForm data={data} mode="edit" />
    </main>
  )
}
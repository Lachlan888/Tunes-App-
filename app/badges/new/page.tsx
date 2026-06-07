import Link from "next/link"
import { redirect } from "next/navigation"
import CreateBadgeForm from "@/components/badges/CreateBadgeForm"
import { loadCreateBadgeData } from "@/lib/loaders/badges"

type NewBadgePageProps = {
  searchParams?: Promise<{
    create_badge?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getCreateBadgeMessage(status: string) {
  if (status === "missing_name") return "Badge name is required."
  if (status === "missing_description") {
    return "Add a short description explaining what this badge rewards."
  }
  if (status === "invalid_category") return "Choose a valid badge type."
  if (status === "invalid_condition") {
    return "Choose what earns this badge and complete the matching details."
  }
  if (status === "error") return "Couldn’t create badge."

  return null
}

export const dynamic = "force-dynamic"

export default async function NewBadgePage({
  searchParams,
}: NewBadgePageProps) {
  let data

  try {
    data = await loadCreateBadgeData()
  } catch {
    redirect("/login")
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const status = getSingleValue(resolvedSearchParams?.create_badge)
  const message = getCreateBadgeMessage(status)

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <div className="mb-5">
        <Link
          href="/badges"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Badges
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
          Create Badge
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
          Create a public badge and choose what earns it. When someone meets
          the condition, the badge is awarded under your name.
        </p>
      </section>

      <CreateBadgeForm data={data} mode="create" />
    </main>
  )
}

import { redirectToLogin } from "@/lib/auth/login-redirect"
import Link from "next/link"
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
    return redirectToLogin()
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const status = getSingleValue(resolvedSearchParams?.create_badge)
  const message = getCreateBadgeMessage(status)

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 md:px-6 text-foreground">
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

      <section className="mb-5 border-b border-border pb-5">
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
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

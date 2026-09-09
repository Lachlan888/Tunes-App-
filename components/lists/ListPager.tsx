import Link from "next/link"
import { withListPage } from "@/lib/list-view-state"

export default function ListPager({
  href,
  page,
  totalPages,
  label,
}: {
  href: string
  page: number
  totalPages: number
  label: string
}) {
  if (totalPages <= 1) return null

  const linkClass =
    "inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

  return (
    <nav aria-label={`${label} pages`} className="mt-5 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link href={withListPage(href, page - 1)} rel="prev" className={linkClass}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={withListPage(href, page + 1)} rel="next" className={linkClass}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

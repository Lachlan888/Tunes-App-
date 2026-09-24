import Link from "next/link"
import EmptyState from "@/components/EmptyState"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { formStyles } from "@/components/ui/formStyles"

export default function TuneDetailNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <EmptyState
        headingAs="h1"
        title="Tune not found"
        description="This tune may have been removed or its link may be incorrect. Search the catalogue for another title or alias."
        icon="search"
      >
        <form action="/library" method="get" className="flex w-full flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="missing-tune-search">
            Search tunes
          </label>
          <input
            id="missing-tune-search"
            name="q"
            type="search"
            placeholder="Search title or alias"
            className={formStyles.input}
          />
          <button type="submit" className={buttonStyles.primary}>
            Search Tunes
          </button>
        </form>
        <Link href="/library" className={buttonStyles.secondary}>
          Back to Tunes
        </Link>
      </EmptyState>
    </main>
  )
}

import Link from "next/link"

export default function PublicListNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-foreground md:px-6 md:py-20">
      <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight md:text-5xl">This list isn’t available</h1>
      <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
        It may have been removed or made private. Private lists are only visible to people the owner has invited.
      </p>
      <form action="/public-lists" method="get" className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
        <label htmlFor="public-list-recovery-search" className="sr-only">Search public lists</label>
        <input id="public-list-recovery-search" name="q" placeholder="Search public lists" className="min-h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]" />
        <button className="min-h-11 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground">Search</button>
      </form>
      <Link href="/public-lists" className="mt-6 inline-flex text-sm font-semibold underline underline-offset-4">Back to Public Lists</Link>
    </main>
  )
}

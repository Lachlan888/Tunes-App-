export default function SharedListsHeader() {
  return (
    <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
        Shared
      </h1>

      <p className="mt-3 max-w-3xl text-lg text-muted-foreground">
        Browse public tune lists from other users, then import the whole list or
        just the tunes you want into your own private lists.
      </p>
    </section>
  )
}
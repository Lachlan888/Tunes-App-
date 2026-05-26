export default function SharedListsHeader() {
  return (
    <section className="mb-5 border-b border-border/70 pb-4 md:mb-8 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
        Public Lists
      </h1>

      <p className="mt-3 hidden max-w-3xl text-lg text-muted-foreground md:block">
        Browse public tune lists from other users, then import the whole list or
        just the tunes you want into your own private lists.
      </p>
    </section>
  )
}

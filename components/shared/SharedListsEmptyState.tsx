export default function SharedListsEmptyState() {
  return (
    <section className="md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Public lists
      </h2>

      <p className="mt-3 border-y border-border/70 py-4 text-sm text-muted-foreground md:mt-4 md:rounded-2xl md:border md:border-border md:bg-background/70 md:p-4">
        No public lists yet.
      </p>
    </section>
  )
}

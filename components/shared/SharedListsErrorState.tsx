type SharedListsErrorStateProps = {
  message: string
}

export default function SharedListsErrorState({
  message,
}: SharedListsErrorStateProps) {
  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Shared
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Could not load shared lists.
        </p>

        <p className="mt-4 rounded-2xl border border-destructive bg-background/70 p-4 text-sm text-destructive">
          {message}
        </p>
      </section>
    </main>
  )
}
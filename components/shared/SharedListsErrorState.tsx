type SharedListsErrorStateProps = {
  message: string
}

export default function SharedListsErrorState({
  message,
}: SharedListsErrorStateProps) {
  return (
    <main className="mx-auto max-w-[1500px] px-4 py-5 text-foreground md:px-6 md:py-8">
      <section className="border-b border-border/70 pb-4 md:rounded-3xl md:border md:border-border md:bg-card md:p-6 md:shadow-sm">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          Public Lists
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Couldn’t load public lists.
        </p>

        <p className="mt-4 border-y border-destructive py-4 text-sm text-destructive md:rounded-2xl md:border md:bg-background/70 md:p-4">
          {message}
        </p>
      </section>
    </main>
  )
}

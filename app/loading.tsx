export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center gap-2">
          <span className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-3 w-3 animate-bounce rounded-full bg-primary" />
        </div>

        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Loading your tunes
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Getting your practice, lists, and repertoire ready.
        </p>

        <div className="mt-6 overflow-hidden rounded-full border border-border bg-background/70">
          <div className="h-2 w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </main>
  )
}
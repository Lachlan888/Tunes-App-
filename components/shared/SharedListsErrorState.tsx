import PageHeader from "@/components/ui/PageHeader"

type SharedListsErrorStateProps = {
  message: string
}

export default function SharedListsErrorState({
  message,
}: SharedListsErrorStateProps) {
  return (
    <main className="mx-auto max-w-[1500px] px-4 pb-5 pt-0 text-foreground md:px-6 md:py-8">
      <PageHeader title="Public Lists" className="hidden md:flex" />

      <section>
        <p className="mt-4 border-y border-destructive py-4 text-sm text-destructive md:rounded-2xl md:border md:bg-background/70 md:p-4">
          {message}
        </p>
      </section>
    </main>
  )
}

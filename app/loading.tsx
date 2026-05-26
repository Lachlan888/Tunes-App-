import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground"
      aria-busy="true"
    >
      <LoadingSpinner
        label="Loading your tunes"
        showLabel
        size="lg"
        className="flex-col gap-4 text-center"
        labelClassName="font-serif text-2xl font-bold tracking-tight text-foreground"
      />
    </main>
  )
}

import LoadingSpinner from "@/components/ui/LoadingSpinner"

type RouteLoadingShellProps = {
  label: string
  title: string
  description: string
  primarySectionTitle: string
  secondarySectionTitle?: string
  mode?: "single" | "split"
}

export default function RouteLoadingShell({
  label,
  title,
  description,
}: RouteLoadingShellProps) {
  return (
    <main
      className="mx-auto flex min-h-[55vh] max-w-[1500px] items-center justify-center px-4 py-10 text-foreground md:px-6"
      aria-busy="true"
    >
      <section className="w-full max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>

        <LoadingSpinner
          label={title}
          showLabel
          size="lg"
          centered
          className="mt-5 flex-col gap-4"
          labelClassName="font-serif text-2xl font-bold tracking-tight text-foreground"
        />

        <p className="mt-3 hidden text-sm leading-6 text-muted-foreground md:block">
          {description}
        </p>
      </section>
    </main>
  )
}

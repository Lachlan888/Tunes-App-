import { LoadingState } from "@/components/ui/Skeleton"

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
  primarySectionTitle,
  secondarySectionTitle,
  mode = "single",
}: RouteLoadingShellProps) {
  return (
    <main
      className="mx-auto flex min-h-[55vh] max-w-[1500px] items-center justify-center px-4 py-10 text-foreground md:px-6"
      aria-busy="true"
    >
      <section className="w-full max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>

        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-text-muted">
          {description}
        </p>

        <div
          className={`mt-6 grid gap-4 ${
            mode === "split" ? "md:grid-cols-2" : ""
          }`}
        >
          <LoadingState label={`Loading ${primarySectionTitle}`} rows={3} />
          {secondarySectionTitle ? (
            <LoadingState label={`Loading ${secondarySectionTitle}`} rows={2} />
          ) : null}
        </div>
      </section>
    </main>
  )
}

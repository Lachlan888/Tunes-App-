import { LoadingState } from "@/components/ui/Skeleton"

type RouteLoadingShellProps = {
  title: string
  primarySectionTitle: string
  secondarySectionTitle?: string
  mode?: "single" | "split"
}

export default function RouteLoadingShell({
  title,
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
        <h1 className="font-sans text-4xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
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

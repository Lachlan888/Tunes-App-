import Link from "next/link"
import ReferencePracticeWorkspace from "@/components/reference-media/ReferencePracticeWorkspace"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { loadTuneDetailData } from "@/lib/loaders/tune-detail"
import { resolveReferenceMediaSource } from "@/lib/tune-media"

type ReferenceMediaPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ media?: string | string[] }>
}

function singleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null
}

export default async function ReferenceMediaPage({
  params,
  searchParams,
}: ReferenceMediaPageProps) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const requestedSourceId = singleValue(resolvedSearchParams?.media)
  const tuneDetail = await loadTuneDetailData(id)

  if (tuneDetail.status !== "loaded") {
    return (
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 text-foreground sm:px-6 sm:py-8">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <h1 className="font-serif text-3xl font-bold">
            {tuneDetail.status === "not_found"
              ? "Tune not found"
              : "Couldn’t load tune"}
          </h1>
          <Link href="/library" className={`${buttonStyles.secondary} mt-5`}>
            Back to Tunes
          </Link>
        </section>
      </main>
    )
  }

  const selectedSource = resolveReferenceMediaSource(
    tuneDetail.tuneMediaBundle,
    requestedSourceId
  )

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <header className="mb-6 min-w-0">
        <Link
          href={`/library/${tuneDetail.pieceId}`}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          Back to tune
        </Link>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Reference practice
        </p>
        <div className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {tuneDetail.typedPiece.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedSource
                ? `${selectedSource.label} · passage-centred practice`
                : "Add a recording to begin passage-centred practice."}
            </p>
          </div>
        </div>
      </header>

      <ReferencePracticeWorkspace
        piece={tuneDetail.typedPiece}
        mediaBundle={tuneDetail.tuneMediaBundle}
        initialSourceId={selectedSource?.id ?? null}
        requestedSourceId={requestedSourceId}
      />
    </main>
  )
}

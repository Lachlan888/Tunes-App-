import Link from "next/link"
import { addToLearningList } from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import {
  getReferencePracticeHref,
  safeReferenceReturn,
} from "@/lib/reference-media-routing"
import ReferencePracticeWorkspace from "@/components/reference-media/ReferencePracticeWorkspace"
import TuneDetailViewNav from "@/components/library/TuneDetailViewNav"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { loadTuneDetailData } from "@/lib/loaders/tune-detail"
import { resolveReferenceMediaSource } from "@/lib/tune-media"

type ReferenceMediaPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ media?: string | string[]; return_to?: string | string[] }>
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
  const returnTo = safeReferenceReturn(singleValue(resolvedSearchParams?.return_to))
  const requestedSourceId = singleValue(resolvedSearchParams?.media)
  const tuneDetail = await loadTuneDetailData(id, "reference")

  if (tuneDetail.status !== "loaded") {
    return (
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 text-foreground sm:px-6 sm:py-8">
        <section className="border-y border-hairline py-6">
          <h1 className="font-sans text-4xl font-bold">
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
  const redirectTo = getReferencePracticeHref(
    tuneDetail.pieceId,
    selectedSource?.id,
    returnTo
  )

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <header className="mb-8 min-w-0 border-b border-hairline pb-6">
        <Link
          href={returnTo ?? `/library/${tuneDetail.pieceId}`}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
        >
          {returnTo?.startsWith("/review") ? "Back to Practice" : "Back to tune"}
        </Link>
        <div className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="break-words font-sans text-4xl font-bold leading-[1.04] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {tuneDetail.typedPiece.title}
            </h1>
            {selectedSource ? <p className="mt-2 text-sm text-muted-foreground">{selectedSource.label}</p> : null}
          </div>
        </div>
      </header>

      <TuneDetailViewNav pieceId={tuneDetail.pieceId} activeView="reference" />

      <ReferencePracticeWorkspace
        piece={tuneDetail.typedPiece}
        mediaBundle={tuneDetail.tuneMediaBundle}
        initialSourceId={selectedSource?.id ?? null}
        requestedSourceId={requestedSourceId}
        userPiece={tuneDetail.typedUserPiece}
        userKnownPiece={tuneDetail.typedUserKnownPiece}
        learningLists={tuneDetail.typedLearningLists}
        learningListItems={tuneDetail.typedLearningListItems}
        practiceDiaryEnabled={tuneDetail.practiceDiaryEnabled}
        redirectTo={redirectTo}
        currentUserId={tuneDetail.user.id}
        startLearning={startLearning}
        addToLearningList={addToLearningList}
      />
    </main>
  )
}

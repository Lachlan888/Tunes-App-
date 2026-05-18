import Link from "next/link"
import type { ReactNode } from "react"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import PieceCommentsSection from "@/components/library/PieceCommentsSection"
import PieceLoreSection from "@/components/library/PieceLoreSection"
import PieceMediaLinksSection from "@/components/library/PieceMediaLinksSection"
import PieceSheetMusicSection from "@/components/library/PieceSheetMusicSection"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TuneDetailActions from "@/components/library/TuneDetailActions"
import TunePageReviewPanel from "@/components/library/TunePageReviewPanel"
import TunePrivateNotesSection from "@/components/library/TunePrivateNotesSection"
import TunePracticeHistorySection from "@/components/practice-diary/TunePracticeHistorySection"
import { upsertUserPieceNotes } from "@/lib/actions/user-piece-metadata"
import {
  addPieceMediaLink,
  addPieceSheetMusicLink,
} from "@/lib/actions/piece-links"
import { addToLearningList } from "@/lib/actions/lists"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadTuneDetailData } from "@/lib/loaders/tune-detail"
import { TUNE_DETAIL_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"
import {
  getSingleSearchParamValue,
  getTuneDetailStatusMessage,
} from "@/lib/tune-detail-status"

type PiecePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    edit_request?: string | string[]
    comment_report?: string | string[]
    lore_report?: string | string[]
    lore?: string | string[]
    moderator_edit?: string | string[]
    diary?: string | string[]
    loop?: string | string[]
    page_options?: string | string[]
  }>
}

function DetailErrorShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <h1 className="min-w-0 break-words font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <div className="mt-4 text-sm text-muted-foreground">{children}</div>

        <div className="mt-5">
          <Link
            href="/library"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Back to Tunes
          </Link>
        </div>
      </section>
    </main>
  )
}

export default async function PiecePage({
  params,
  searchParams,
}: PiecePageProps) {
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const tuneDetail = await loadTuneDetailData(id)

  if (tuneDetail.status === "load_error") {
    return (
      <DetailErrorShell title="Tune">
        <p className="text-destructive">Could not load tune.</p>
      </DetailErrorShell>
    )
  }

  if (tuneDetail.status === "not_found") {
    return (
      <DetailErrorShell title="Tune not found">
        <p>No tune exists at id {tuneDetail.pieceId}.</p>
      </DetailErrorShell>
    )
  }

  const {
    user,
    currentUserRole,
    pieceId,
    redirectTo,
    typedPiece,
    typedUserPieceMetadata,
    typedSheetMusicLinks,
    typedMediaLinks,
    typedMediaLoops,
    typedPieceComments,
    typedPieceLoreEntries,
    typedUserPiece,
    typedUserKnownPiece,
    typedLearningLists,
    typedLearningListItems,
    typedPracticeNotes,
    typedTunePagePreferences,
    practiceDiaryEnabled,
    practiceNoteCategories,
    styleOptions,
    profileMap,
  } = tuneDetail

  const statusMessage = getTuneDetailStatusMessage({
    editRequest: getSingleSearchParamValue(
      resolvedSearchParams?.edit_request
    ),
    commentReport: getSingleSearchParamValue(
      resolvedSearchParams?.comment_report
    ),
    loreReport: getSingleSearchParamValue(
      resolvedSearchParams?.lore_report
    ),
    lore: getSingleSearchParamValue(resolvedSearchParams?.lore),
    moderatorEdit: getSingleSearchParamValue(
      resolvedSearchParams?.moderator_edit
    ),
    diary: getSingleSearchParamValue(resolvedSearchParams?.diary),
    loop: getSingleSearchParamValue(resolvedSearchParams?.loop),
    pageOptions: getSingleSearchParamValue(
      resolvedSearchParams?.page_options
    ),
  })

  const showTuneSection = (sectionId: string) =>
    typedTunePagePreferences.visibleSections[sectionId] ?? true

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 text-foreground sm:px-6 sm:py-8">
      <div className="mb-5">
        <Link
          href="/library"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Tunes
        </Link>
      </div>

      {statusMessage ? (
        <div className="mb-6 w-full max-w-full overflow-hidden rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="max-w-5xl break-words font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {typedPiece.title}
            </h1>
          </div>

          <div className="shrink-0">
            <PageOptionsModal
              config={TUNE_DETAIL_PAGE_OPTIONS_CONFIG}
              preferences={typedTunePagePreferences}
              redirectTo={redirectTo}
            />
          </div>
        </div>
      </section>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 sm:mt-8 sm:gap-8 xl:grid-cols-2 2xl:grid-cols-3">
        <div className="min-w-0 space-y-6 sm:space-y-8">
          {showTuneSection("tune_state") ? (
            <TuneDetailActions
              piece={typedPiece}
              userPiece={typedUserPiece}
              userKnownPiece={typedUserKnownPiece}
              learningLists={typedLearningLists}
              learningListItems={typedLearningListItems}
              redirectTo={redirectTo}
              startLearning={startLearning}
              addToLearningList={addToLearningList}
            />
          ) : null}

          {showTuneSection("tune_review") ? (
            <TunePageReviewPanel
              piece={typedPiece}
              userPiece={typedUserPiece}
              redirectTo={redirectTo}
              practiceDiaryEnabled={practiceDiaryEnabled}
              noteCategories={practiceNoteCategories}
            />
          ) : null}

          {showTuneSection("canonical_details") ? (
            <TuneCanonicalDetailsCard
              piece={typedPiece}
              redirectTo={redirectTo}
              styleOptions={styleOptions}
              currentUserRole={currentUserRole}
            />
          ) : null}
        </div>

        <div className="min-w-0 space-y-6 sm:space-y-8">
          {showTuneSection("my_notes") ? (
            <TunePrivateNotesSection
              pieceId={pieceId}
              redirectTo={redirectTo}
              userPieceMetadata={typedUserPieceMetadata}
              upsertUserPieceNotes={upsertUserPieceNotes}
            />
          ) : null}

          {showTuneSection("practice_history") ? (
            <TunePracticeHistorySection notes={typedPracticeNotes} />
          ) : null}

          {showTuneSection("media_links") ? (
            <PieceMediaLinksSection
              pieceId={pieceId}
              redirectTo={redirectTo}
              mediaLinks={typedMediaLinks}
              savedLoops={typedMediaLoops}
              referenceUrl={typedPiece.reference_url}
              referenceTitle={typedPiece.title}
              addPieceMediaLink={addPieceMediaLink}
            />
          ) : null}

          {showTuneSection("sheet_music") ? (
            <PieceSheetMusicSection
              pieceId={pieceId}
              redirectTo={redirectTo}
              sheetMusicLinks={typedSheetMusicLinks}
              addPieceSheetMusicLink={addPieceSheetMusicLink}
            />
          ) : null}
        </div>

        <div className="min-w-0 space-y-6 sm:space-y-8 xl:col-span-2 2xl:col-span-1">
          {showTuneSection("lore") ? (
            <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <PieceLoreSection
                pieceId={pieceId}
                loreEntries={typedPieceLoreEntries}
                profileMap={profileMap}
                currentUserId={user.id}
                currentUserRole={currentUserRole}
              />
            </section>
          ) : null}

          {showTuneSection("comments") ? (
            <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <PieceCommentsSection
                pieceId={pieceId}
                comments={typedPieceComments}
                profileMap={profileMap}
                currentUserId={user.id}
              />
            </section>
          ) : null}
        </div>
      </div>
    </main>
  )
}
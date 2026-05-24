import Link from "next/link"
import type { ReactNode } from "react"
import AddToListAction from "@/components/AddToListAction"
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import PieceCommentsSection from "@/components/library/PieceCommentsSection"
import PieceLoreSection from "@/components/library/PieceLoreSection"
import PieceMediaLinksSection from "@/components/library/PieceMediaLinksSection"
import PieceSheetMusicSection from "@/components/library/PieceSheetMusicSection"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TuneDetailActions from "@/components/library/TuneDetailActions"
import TuneDetailMobileSwitcher from "@/components/library/TuneDetailMobileSwitcher"
import TunePageReviewPanel from "@/components/library/TunePageReviewPanel"
import TunePrivateNotesSection from "@/components/library/TunePrivateNotesSection"
import TunePracticeHistorySection from "@/components/practice-diary/TunePracticeHistorySection"
import { upsertUserPieceNotes } from "@/lib/actions/user-piece-metadata"
import {
  addPieceMediaLink,
  addPieceSheetMusicLink,
} from "@/lib/actions/piece-links"
import { addToLearningList } from "@/lib/actions/lists"
import { addReferenceUrlToPiece } from "@/lib/actions/reference-media"
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
    reference_url?: string | string[]
    diary?: string | string[]
    loop?: string | string[]
    page_options?: string | string[]
    list_add?: string | string[]
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
    referenceUrl: getSingleSearchParamValue(
      resolvedSearchParams?.reference_url
    ),
    diary: getSingleSearchParamValue(resolvedSearchParams?.diary),
    loop: getSingleSearchParamValue(resolvedSearchParams?.loop),
    pageOptions: getSingleSearchParamValue(
      resolvedSearchParams?.page_options
    ),
    listAdd: getSingleSearchParamValue(resolvedSearchParams?.list_add),
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

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {typedPiece.key ? (
                <span className="rounded-full border border-border bg-background/70 px-3 py-1">
                  Key: {typedPiece.key}
                </span>
              ) : null}

              {typedPiece.style ? (
                <span className="rounded-full border border-border bg-background/70 px-3 py-1">
                  {typedPiece.style}
                </span>
              ) : null}

              {typedPiece.time_signature ? (
                <span className="rounded-full border border-border bg-background/70 px-3 py-1">
                  {typedPiece.time_signature}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <AddToListAction
              piece={typedPiece}
              learningLists={typedLearningLists}
              learningListItems={typedLearningListItems}
              redirectTo={redirectTo}
              addToLearningList={addToLearningList}
              buttonClassName="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full border border-primary bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] sm:w-auto"
            />

            <PageOptionsModal
              config={TUNE_DETAIL_PAGE_OPTIONS_CONFIG}
              preferences={typedTunePagePreferences}
              redirectTo={redirectTo}
            />
          </div>
        </div>
      </section>

      <div className="mt-5 md:mt-8">
        <TuneDetailMobileSwitcher
          pieceId={pieceId}
          currentUserId={user.id}
          currentUserRole={currentUserRole}
          redirectTo={redirectTo}
          piece={typedPiece}
          userPiece={typedUserPiece}
          userKnownPiece={typedUserKnownPiece}
          userPieceMetadata={typedUserPieceMetadata}
          sheetMusicLinks={typedSheetMusicLinks}
          mediaLinks={typedMediaLinks}
          mediaLoops={typedMediaLoops}
          pieceComments={typedPieceComments}
          pieceLoreEntries={typedPieceLoreEntries}
          learningLists={typedLearningLists}
          learningListItems={typedLearningListItems}
          practiceNotes={typedPracticeNotes}
          tunePagePreferences={typedTunePagePreferences}
          practiceDiaryEnabled={practiceDiaryEnabled}
          practiceNoteCategories={practiceNoteCategories}
          styleOptions={styleOptions}
          profileMap={profileMap}
          startLearning={startLearning}
          addToLearningList={addToLearningList}
          upsertUserPieceNotes={upsertUserPieceNotes}
          addPieceMediaLink={addPieceMediaLink}
          addPieceSheetMusicLink={addPieceSheetMusicLink}
          addReferenceUrlToPiece={addReferenceUrlToPiece}
        />
      </div>

      <div className="mt-6 hidden min-w-0 grid-cols-1 gap-6 sm:mt-8 sm:gap-8 md:grid xl:grid-cols-2 2xl:grid-cols-3">
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
              piece={typedPiece}
              redirectTo={redirectTo}
              mediaLinks={typedMediaLinks}
              savedLoops={typedMediaLoops}
              addPieceMediaLink={addPieceMediaLink}
              addReferenceUrlToPiece={addReferenceUrlToPiece}
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
import Link from "next/link"
import type { ReactNode } from "react"
import AddToListAction from "@/components/AddToListAction"
import PieceCommentsSection from "@/components/library/PieceCommentsSection"
import PieceLoreSection from "@/components/library/PieceLoreSection"
import ReferenceMediaSection from "@/components/library/ReferenceMediaSection"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TuneDetailActions from "@/components/library/TuneDetailActions"
import TunePageReviewPanel from "@/components/library/TunePageReviewPanel"
import TunePrivateNotesSection from "@/components/library/TunePrivateNotesSection"
import TunePracticeHistorySection from "@/components/practice-diary/TunePracticeHistorySection"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import {
  removePreferredReferenceUrl,
  upsertPreferredReferenceUrl,
  upsertUserPieceNotes,
} from "@/lib/actions/user-piece-metadata"
import {
  addPieceMediaLink,
  removePieceMediaLink,
} from "@/lib/actions/media-links"
import { addPieceSheetMusicLink } from "@/lib/actions/piece-links"
import { addToLearningList } from "@/lib/actions/lists"
import { addReferenceUrlToPiece } from "@/lib/actions/reference-media"
import { startLearning } from "@/lib/actions/user-pieces"
import { loadTuneDetailData } from "@/lib/loaders/tune-detail"
import {
  getSingleSearchParamValue,
  getTuneDetailStatusMessage,
} from "@/lib/tune-detail-status"
import type { LearningList } from "@/lib/types"
import type {
  LearningListItemRow,
  PublicTuneListSummary,
  PieceLoreEntryRow,
  ProfileRow,
} from "@/lib/loaders/tune-detail"

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
    preferred_reference?: string | string[]
    media_link?: string | string[]
    diary?: string | string[]
    loop?: string | string[]
    list_add?: string | string[]
    create_tune?: string | string[]
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

function getProfileName(publicList: PublicTuneListSummary) {
  const profile = Array.isArray(publicList.profiles)
    ? publicList.profiles[0]
    : publicList.profiles

  return profile?.display_name || profile?.username || "Unknown player"
}

function TuneListChip({
  href,
  label,
  helper,
}: {
  href: string
  label: string
  helper?: string
}) {
  return (
    <Link
      href={href}
      className="inline-flex max-w-[16rem] items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
    >
      <span className="truncate">{label}</span>
      {helper ? (
        <span className="shrink-0 text-xs font-medium text-muted-foreground/80">
          {helper}
        </span>
      ) : null}
    </Link>
  )
}

function MoreListCount({ count }: { count: number }) {
  if (count <= 0) {
    return null
  }

  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background/50 px-3 py-1.5 text-sm font-semibold text-muted-foreground">
      +{count} more
    </span>
  )
}

function TuneListMemberships({
  userLists,
  userListItems,
  emptyMessage = "This tune is not in any of your lists yet.",
}: {
  userLists: LearningList[]
  userListItems: LearningListItemRow[]
  emptyMessage?: string
}) {
  const visibleLimit = 3
  const userListIdsForTune = new Set(
    userListItems.map((item) => item.learning_list_id)
  )
  const userListsForTune = userLists.filter((list) =>
    userListIdsForTune.has(list.id)
  )

  const visibleUserLists = userListsForTune.slice(0, visibleLimit)
  const hiddenUserListCount = Math.max(
    userListsForTune.length - visibleUserLists.length,
    0
  )

  if (userListsForTune.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {visibleUserLists.map((list) => (
        <TuneListChip
          key={list.id}
          href={`/learning-lists/${list.id}`}
          label={list.name}
          helper={list.visibility === "public" ? "Public" : undefined}
        />
      ))}

      <MoreListCount count={hiddenUserListCount} />
    </div>
  )
}

function PublicListAppearances({
  publicLists,
}: {
  publicLists: PublicTuneListSummary[]
}) {
  const visibleLimit = 6
  const visiblePublicLists = publicLists.slice(0, visibleLimit)
  const hiddenPublicListCount = Math.max(
    publicLists.length - visiblePublicLists.length,
    0
  )

  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Public-list appearances
      </h2>

      {publicLists.length > 0 ? (
        <div className="mt-5 flex min-w-0 flex-wrap gap-2">
          {visiblePublicLists.map((list) => (
            <TuneListChip
              key={list.id}
              href={`/public-lists/${list.id}`}
              label={list.name}
              helper={getProfileName(list)}
            />
          ))}

          <MoreListCount count={hiddenPublicListCount} />
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          This tune does not appear in any public lists yet.
        </p>
      )}
    </section>
  )
}

function getAlternateTitle(loreEntries: PieceLoreEntryRow[]) {
  return (
    loreEntries.find((entry) => entry.category === "alternate_title")
      ?.entry_text ?? null
  )
}

function getComposerLabel({
  composer,
  composerProfile,
}: {
  composer?: string | null
  composerProfile: ProfileRow | null
}) {
  if (composerProfile) {
    return (
      composerProfile.display_name ||
      composerProfile.username ||
      composer ||
      "Linked Tunes App composer"
    )
  }

  return composer || null
}

function getTuneStateSummary({
  userPiece,
  userKnownPiece,
}: {
  userPiece: { stage?: number | string | null } | null
  userKnownPiece: unknown | null
}) {
  if (userPiece) {
    return userPiece.stage
      ? `In Practice, Stage ${userPiece.stage}`
      : "In Practice"
  }

  if (userKnownPiece) {
    return "Known"
  }

  return "Not yet in your Practice or Known tunes"
}

function OverviewField({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 min-w-0 break-words text-sm font-semibold text-foreground">
        {value || <span className="font-medium text-muted-foreground">Missing</span>}
      </p>
    </div>
  )
}

function TuneOverviewSection({
  piece,
  alternateTitle,
  composerProfile,
  stateSummary,
  headerAction,
}: {
  piece: {
    title: string
    key: string | null
    style: string | null
    time_signature: string | null
    composer?: string | null
  }
  alternateTitle: string | null
  composerProfile: ProfileRow | null
  stateSummary: string
  headerAction?: ReactNode
}) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Overview
          </p>
          <h1 className="mt-3 max-w-5xl break-words font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {piece.title}
          </h1>
          {alternateTitle ? (
            <p className="mt-3 max-w-3xl break-words text-lg font-medium text-muted-foreground">
              Also known as {alternateTitle}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 rounded-2xl border border-success bg-success/10 px-4 py-3 text-sm font-semibold text-foreground lg:max-w-xs">
          {stateSummary}
        </div>

        {headerAction ? (
          <div className="shrink-0 lg:self-start">{headerAction}</div>
        ) : null}
      </div>

      <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewField label="Key" value={piece.key} />
        <OverviewField label="Style" value={piece.style} />
        <OverviewField label="Time signature" value={piece.time_signature} />
        <OverviewField
          label="Composer / source"
          value={getComposerLabel({
            composer: piece.composer,
            composerProfile,
          })}
        />
      </div>
    </section>
  )
}

function TuneManageSection({
  piece,
  redirectTo,
  learningLists,
  learningListItems,
  addToLearningList,
  styleOptions,
  composerProfile,
  composerProfileOptions,
  currentUserRole,
  showCanonicalDetails,
}: {
  piece: Parameters<typeof AddToListAction>[0]["piece"]
  redirectTo: string
  learningLists: LearningList[]
  learningListItems: LearningListItemRow[]
  addToLearningList: (formData: FormData) => Promise<void>
  styleOptions: Parameters<typeof TuneCanonicalDetailsCard>[0]["styleOptions"]
  composerProfile: ProfileRow | null
  composerProfileOptions: ProfileRow[]
  currentUserRole: Parameters<typeof TuneCanonicalDetailsCard>[0]["currentUserRole"]
  showCanonicalDetails: boolean
}) {
  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Manage
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        List membership and infrequent tune-management actions.
      </p>

      <div className="mt-5 space-y-6">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Your list membership
            </h3>

            <AddToListAction
              piece={piece}
              learningLists={learningLists}
              learningListItems={learningListItems}
              redirectTo={redirectTo}
              addToLearningList={addToLearningList}
              buttonClassName={joinClasses(buttonStyles.secondary, "w-full sm:w-auto")}
            />
          </div>

          <div className="mt-3">
            <TuneListMemberships
              userLists={learningLists}
              userListItems={learningListItems}
            />
          </div>
        </div>

        {showCanonicalDetails ? (
          <TuneCanonicalDetailsCard
            piece={piece}
            redirectTo={redirectTo}
            styleOptions={styleOptions}
            composerProfile={composerProfile}
            composerProfileOptions={composerProfileOptions}
            currentUserRole={currentUserRole}
            variant="mobile"
          />
        ) : null}

        <div className="rounded-2xl border border-destructive/35 bg-background/70 p-4">
          <h3 className="text-base font-semibold text-foreground">
            Remove from my app
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Removes your personal relationship with this tune. Shared tune
            details remain for everyone else.
          </p>
          <div className="mt-4">
            <RemoveTuneButton
              pieceId={piece.id}
              redirectTo={redirectTo}
              className={joinClasses(
                buttonStyles.destructiveSecondary,
                "w-full sm:w-auto"
              )}
            />
          </div>
        </div>
      </div>
    </section>
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
        <p className="text-destructive">Couldn’t load tune.</p>
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
    tuneMediaBundle,
    typedPieceComments,
    typedPieceLoreEntries,
    typedUserPiece,
    typedUserKnownPiece,
    typedLearningLists,
    typedLearningListItems,
    typedPublicTuneLists,
    typedPracticeNotes,
    practiceDiaryEnabled,
    practiceNoteCategories,
    styleOptions,
    composerProfile,
    composerProfileOptions,
    profileMap,
  } = tuneDetail

  const statusMessage = getTuneDetailStatusMessage({
    editRequest: getSingleSearchParamValue(
      resolvedSearchParams?.edit_request
    ),
    commentReport: getSingleSearchParamValue(
      resolvedSearchParams?.comment_report
    ),
    loreReport: getSingleSearchParamValue(resolvedSearchParams?.lore_report),
    lore: getSingleSearchParamValue(resolvedSearchParams?.lore),
    moderatorEdit: getSingleSearchParamValue(
      resolvedSearchParams?.moderator_edit
    ),
    referenceUrl: getSingleSearchParamValue(
      resolvedSearchParams?.reference_url
    ),
    preferredReference: getSingleSearchParamValue(
      resolvedSearchParams?.preferred_reference
    ),
    mediaLink: getSingleSearchParamValue(resolvedSearchParams?.media_link),
    diary: getSingleSearchParamValue(resolvedSearchParams?.diary),
    loop: getSingleSearchParamValue(resolvedSearchParams?.loop),
    listAdd: getSingleSearchParamValue(resolvedSearchParams?.list_add),
    createTune: getSingleSearchParamValue(resolvedSearchParams?.create_tune),
  })

  const showTuneSection = (sectionId: string) => {
    void sectionId
    return true
  }
  const alternateTitle = getAlternateTitle(typedPieceLoreEntries)
  const stateSummary = getTuneStateSummary({
    userPiece: typedUserPiece,
    userKnownPiece: typedUserKnownPiece,
  })

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

      <TuneOverviewSection
        piece={typedPiece}
        alternateTitle={alternateTitle}
        composerProfile={composerProfile}
        stateSummary={stateSummary}
      />

      <div className="mt-8 min-w-0 space-y-8">
        {(showTuneSection("media_links") || showTuneSection("sheet_music")) ? (
          <ReferenceMediaSection
            piece={typedPiece}
            currentUserId={user.id}
            redirectTo={redirectTo}
            mediaBundle={tuneMediaBundle}
            addReferenceUrlToPiece={addReferenceUrlToPiece}
            upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
            removePreferredReferenceUrl={removePreferredReferenceUrl}
            addPieceMediaLink={addPieceMediaLink}
            removePieceMediaLink={removePieceMediaLink}
            addPieceSheetMusicLink={addPieceSheetMusicLink}
          />
        ) : null}

        <section className="min-w-0 space-y-6" aria-labelledby="my-practice-heading">
          <div className="min-w-0">
            <h2
              id="my-practice-heading"
              className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              My Practice
            </h2>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="min-w-0 space-y-6">
              {showTuneSection("tune_state") ? (
                <TuneDetailActions
                  piece={typedPiece}
                  userPiece={typedUserPiece}
                  userKnownPiece={typedUserKnownPiece}
                  redirectTo={redirectTo}
                  startLearning={startLearning}
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
            </div>

            <div className="min-w-0 space-y-6">
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
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-6" aria-labelledby="community-heading">
          <div className="min-w-0">
            <h2
              id="community-heading"
              className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Community
            </h2>
          </div>

          <PublicListAppearances publicLists={typedPublicTuneLists} />

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            {showTuneSection("lore") ? (
              <PieceLoreSection
                pieceId={pieceId}
                loreEntries={typedPieceLoreEntries}
                profileMap={profileMap}
                currentUserId={user.id}
                currentUserRole={currentUserRole}
              />
            ) : null}

            {showTuneSection("comments") ? (
              <PieceCommentsSection
                pieceId={pieceId}
                comments={typedPieceComments}
                profileMap={profileMap}
                currentUserId={user.id}
              />
            ) : null}
          </div>
        </section>

        <TuneManageSection
          piece={typedPiece}
          redirectTo={redirectTo}
          learningLists={typedLearningLists}
          learningListItems={typedLearningListItems}
          addToLearningList={addToLearningList}
          styleOptions={styleOptions}
          composerProfile={composerProfile}
          composerProfileOptions={composerProfileOptions}
          currentUserRole={currentUserRole}
          showCanonicalDetails={showTuneSection("canonical_details")}
        />
      </div>
    </main>
  )
}

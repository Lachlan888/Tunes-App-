"use client"

import { useState } from "react"
import PieceCommentsSection from "@/components/library/PieceCommentsSection"
import PieceLoreSection from "@/components/library/PieceLoreSection"
import PieceMediaLinksSection from "@/components/library/PieceMediaLinksSection"
import PieceSheetMusicSection from "@/components/library/PieceSheetMusicSection"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TuneDetailActions from "@/components/library/TuneDetailActions"
import TunePageReviewPanel from "@/components/library/TunePageReviewPanel"
import TunePrivateNotesSection from "@/components/library/TunePrivateNotesSection"
import TunePracticeHistorySection from "@/components/practice-diary/TunePracticeHistorySection"
import { joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type {
  CommentAuthor,
  LearningListItemRow,
  PieceCommentRow,
  PieceLoreEntryRow,
  PieceMediaLink,
  PieceSheetMusicLink,
  TunePracticeNote,
  UserPieceMediaLoop,
  UserPieceMetadata,
} from "@/lib/loaders/tune-detail"
import type { PageOptionsPreferences } from "@/lib/page-options/types"
import type {
  LearningList,
  Piece,
  StyleOption,
  UserKnownPiece,
  UserPiece,
  UserRole,
} from "@/lib/types"

type TuneDetailMobileTab = "media" | "practice" | "notes" | "community"

type TuneDetailMobileSwitcherProps = {
  pieceId: number
  currentUserId: string
  currentUserRole: UserRole
  redirectTo: string
  piece: Piece
  userPiece: UserPiece | null
  userKnownPiece: UserKnownPiece | null
  userPieceMetadata: UserPieceMetadata | null
  sheetMusicLinks: PieceSheetMusicLink[]
  mediaLinks: PieceMediaLink[]
  mediaLoops: UserPieceMediaLoop[]
  pieceComments: PieceCommentRow[]
  pieceLoreEntries: PieceLoreEntryRow[]
  learningLists: LearningList[]
  learningListItems: LearningListItemRow[]
  practiceNotes: TunePracticeNote[]
  tunePagePreferences: PageOptionsPreferences
  practiceDiaryEnabled: boolean
  practiceNoteCategories: PracticeNoteCategory[]
  styleOptions: StyleOption[]
  profileMap: Record<string, CommentAuthor>
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
  upsertUserPieceNotes: (formData: FormData) => Promise<void>
  addPieceMediaLink: (formData: FormData) => Promise<void>
  addPieceSheetMusicLink: (formData: FormData) => Promise<void>
  addReferenceUrlToPiece: (formData: FormData) => Promise<void>
}

const tabs: { id: TuneDetailMobileTab; label: string }[] = [
  { id: "media", label: "Media" },
  { id: "practice", label: "Practice" },
  { id: "notes", label: "Notes" },
  { id: "community", label: "Lore" },
]

function isSectionVisible(
  tunePagePreferences: PageOptionsPreferences,
  sectionId: string
) {
  return tunePagePreferences.visibleSections[sectionId] ?? true
}

function MobileSwitcher({
  activeTab,
  onChange,
}: {
  activeTab: TuneDetailMobileTab
  onChange: (tab: TuneDetailMobileTab) => void
}) {
  return (
    <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="rounded-full border border-border bg-card-strong/70 p-1 shadow-sm">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={joinClasses(
                  "min-w-0 rounded-full px-2 py-2 text-center text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                <span className="block truncate">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function EmptyMobileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-dashed border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function TuneDetailMobileSwitcher({
  pieceId,
  currentUserId,
  currentUserRole,
  redirectTo,
  piece,
  userPiece,
  userKnownPiece,
  userPieceMetadata,
  sheetMusicLinks,
  mediaLinks,
  mediaLoops,
  pieceComments,
  pieceLoreEntries,
  learningLists,
  learningListItems,
  practiceNotes,
  tunePagePreferences,
  practiceDiaryEnabled,
  practiceNoteCategories,
  styleOptions,
  profileMap,
  startLearning,
  addToLearningList,
  upsertUserPieceNotes,
  addPieceMediaLink,
  addPieceSheetMusicLink,
  addReferenceUrlToPiece,
}: TuneDetailMobileSwitcherProps) {
  const [activeTab, setActiveTab] = useState<TuneDetailMobileTab>("media")

  const showMediaLinks = isSectionVisible(
    tunePagePreferences,
    "media_links"
  )
  const showSheetMusic = isSectionVisible(
    tunePagePreferences,
    "sheet_music"
  )
  const showTuneState = isSectionVisible(
    tunePagePreferences,
    "tune_state"
  )
  const showTuneReview = isSectionVisible(
    tunePagePreferences,
    "tune_review"
  )
  const showCanonicalDetails = isSectionVisible(
    tunePagePreferences,
    "canonical_details"
  )
  const showMyNotes = isSectionVisible(tunePagePreferences, "my_notes")
  const showPracticeHistory = isSectionVisible(
    tunePagePreferences,
    "practice_history"
  )
  const showLore = isSectionVisible(tunePagePreferences, "lore")
  const showComments = isSectionVisible(tunePagePreferences, "comments")

  return (
    <section className="space-y-5 md:hidden">
      <MobileSwitcher activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "media" ? (
        <div className="space-y-5">
          {showMediaLinks ? (
            <PieceMediaLinksSection
              piece={piece}
              redirectTo={redirectTo}
              mediaLinks={mediaLinks}
              savedLoops={mediaLoops}
              addPieceMediaLink={addPieceMediaLink}
              addReferenceUrlToPiece={addReferenceUrlToPiece}
            />
          ) : null}

          {showSheetMusic ? (
            <PieceSheetMusicSection
              pieceId={pieceId}
              redirectTo={redirectTo}
              sheetMusicLinks={sheetMusicLinks}
              addPieceSheetMusicLink={addPieceSheetMusicLink}
            />
          ) : null}

          {!showMediaLinks && !showSheetMusic ? (
            <EmptyMobileSection title="Media">
              <p>
                Media and sheet music sections are hidden in Tune Page Options.
              </p>
            </EmptyMobileSection>
          ) : null}
        </div>
      ) : null}

      {activeTab === "practice" ? (
        <div className="space-y-5">
          {showTuneState ? (
            <TuneDetailActions
              piece={piece}
              userPiece={userPiece}
              userKnownPiece={userKnownPiece}
              learningLists={learningLists}
              learningListItems={learningListItems}
              redirectTo={redirectTo}
              startLearning={startLearning}
              addToLearningList={addToLearningList}
            />
          ) : null}

          {showTuneReview ? (
            <TunePageReviewPanel
              piece={piece}
              userPiece={userPiece}
              redirectTo={redirectTo}
              practiceDiaryEnabled={practiceDiaryEnabled}
              noteCategories={practiceNoteCategories}
            />
          ) : null}

          {showCanonicalDetails ? (
            <TuneCanonicalDetailsCard
              piece={piece}
              redirectTo={redirectTo}
              styleOptions={styleOptions}
              currentUserRole={currentUserRole}
            />
          ) : null}

          {!showTuneState && !showTuneReview && !showCanonicalDetails ? (
            <EmptyMobileSection title="Practice">
              <p>
                Practice and tune-detail sections are hidden in Tune Page
                Options.
              </p>
            </EmptyMobileSection>
          ) : null}
        </div>
      ) : null}

      {activeTab === "notes" ? (
        <div className="space-y-5">
          {showMyNotes ? (
            <TunePrivateNotesSection
              pieceId={pieceId}
              redirectTo={redirectTo}
              userPieceMetadata={userPieceMetadata}
              upsertUserPieceNotes={upsertUserPieceNotes}
            />
          ) : null}

          {showPracticeHistory ? (
            <TunePracticeHistorySection notes={practiceNotes} />
          ) : null}

          {!showMyNotes && !showPracticeHistory ? (
            <EmptyMobileSection title="Notes">
              <p>Notes sections are hidden in Tune Page Options.</p>
            </EmptyMobileSection>
          ) : null}
        </div>
      ) : null}

      {activeTab === "community" ? (
        <div className="space-y-5">
          {showLore ? (
            <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm">
              <PieceLoreSection
                pieceId={pieceId}
                loreEntries={pieceLoreEntries}
                profileMap={profileMap}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            </section>
          ) : null}

          {showComments ? (
            <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm">
              <PieceCommentsSection
                pieceId={pieceId}
                comments={pieceComments}
                profileMap={profileMap}
                currentUserId={currentUserId}
              />
            </section>
          ) : null}

          {!showLore && !showComments ? (
            <EmptyMobileSection title="Lore">
              <p>Lore and comment sections are hidden in Tune Page Options.</p>
            </EmptyMobileSection>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
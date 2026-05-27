"use client"

import { useState } from "react"
import MobileTuneLoreSection from "@/components/library/mobile/MobileTuneLoreSection"
import MobileTuneMediaSection from "@/components/library/mobile/MobileTuneMediaSection"
import MobileTuneNotesSection from "@/components/library/mobile/MobileTuneNotesSection"
import MobileTuneStateSection from "@/components/library/mobile/MobileTuneStateSection"
import { joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type {
  CommentAuthor,
  LearningListItemRow,
  PieceCommentRow,
  PieceLoreEntryRow,
  PieceSheetMusicLink,
  ProfileRow,
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
  composerProfile: ProfileRow | null
  composerProfileOptions: ProfileRow[]
  profileMap: Record<string, CommentAuthor>
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
  upsertUserPieceNotes: (formData: FormData) => Promise<void>
  upsertPreferredReferenceUrl: (formData: FormData) => Promise<void>
  removePreferredReferenceUrl: (formData: FormData) => Promise<void>
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
  composerProfile,
  composerProfileOptions,
  profileMap,
  startLearning,
  addToLearningList,
  upsertUserPieceNotes,
  upsertPreferredReferenceUrl,
  removePreferredReferenceUrl,
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
        <MobileTuneMediaSection
          piece={piece}
          redirectTo={redirectTo}
          userPieceMetadata={userPieceMetadata}
          savedLoops={mediaLoops}
          sheetMusicLinks={sheetMusicLinks}
          showMediaLinks={showMediaLinks}
          showSheetMusic={showSheetMusic}
          upsertPreferredReferenceUrl={upsertPreferredReferenceUrl}
          removePreferredReferenceUrl={removePreferredReferenceUrl}
          addPieceSheetMusicLink={addPieceSheetMusicLink}
          addReferenceUrlToPiece={addReferenceUrlToPiece}
        />
      ) : null}

      {activeTab === "practice" ? (
        <MobileTuneStateSection
          piece={piece}
          userPiece={userPiece}
          userKnownPiece={userKnownPiece}
          learningLists={learningLists}
          learningListItems={learningListItems}
          redirectTo={redirectTo}
          showTuneState={showTuneState}
          showTuneReview={showTuneReview}
          showCanonicalDetails={showCanonicalDetails}
          practiceDiaryEnabled={practiceDiaryEnabled}
          noteCategories={practiceNoteCategories}
          styleOptions={styleOptions}
          composerProfile={composerProfile}
          composerProfileOptions={composerProfileOptions}
          currentUserRole={currentUserRole}
          startLearning={startLearning}
          addToLearningList={addToLearningList}
        />
      ) : null}

      {activeTab === "notes" ? (
        <MobileTuneNotesSection
          pieceId={pieceId}
          redirectTo={redirectTo}
          userPieceMetadata={userPieceMetadata}
          practiceNotes={practiceNotes}
          showMyNotes={showMyNotes}
          showPracticeHistory={showPracticeHistory}
          upsertUserPieceNotes={upsertUserPieceNotes}
        />
      ) : null}

      {activeTab === "community" ? (
        <MobileTuneLoreSection
          pieceId={pieceId}
          loreEntries={pieceLoreEntries}
          comments={pieceComments}
          profileMap={profileMap}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          showLore={showLore}
          showComments={showComments}
        />
      ) : null}
    </section>
  )
}
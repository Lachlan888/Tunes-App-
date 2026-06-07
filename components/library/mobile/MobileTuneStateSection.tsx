"use client"

import AddToListAction from "@/components/AddToListAction"
import MarkAsKnownButton from "@/components/MarkAsKnownButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RemoveTuneButton from "@/components/RemoveTuneButton"
import StartPracticeButton from "@/components/StartPracticeButton"
import TuneCanonicalDetailsCard from "@/components/library/TuneCanonicalDetailsCard"
import TunePageReviewPanel from "@/components/library/TunePageReviewPanel"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"
import type { ProfileRow } from "@/lib/loaders/tune-detail"
import type { LearningListItemRow } from "@/lib/loaders/tune-detail"
import type {
  LearningList,
  Piece,
  StyleOption,
  UserKnownPiece,
  UserPiece,
  UserRole,
} from "@/lib/types"

type MobileTuneStateSectionProps = {
  piece: Piece
  userPiece: UserPiece | null
  userKnownPiece: UserKnownPiece | null
  learningLists: LearningList[]
  learningListItems: LearningListItemRow[]
  redirectTo: string
  showTuneState: boolean
  showTuneReview: boolean
  showCanonicalDetails: boolean
  practiceDiaryEnabled: boolean
  noteCategories: PracticeNoteCategory[]
  styleOptions: StyleOption[]
  composerProfile: ProfileRow | null
  composerProfileOptions: ProfileRow[]
  currentUserRole: UserRole
  startLearning: (formData: FormData) => Promise<void>
  addToLearningList: (formData: FormData) => Promise<void>
}

function MobileSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="min-w-0 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  )
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 py-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="min-w-0 break-words text-right text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  )
}

export default function MobileTuneStateSection({
  piece,
  userPiece,
  userKnownPiece,
  learningLists,
  learningListItems,
  redirectTo,
  showTuneState,
  showTuneReview,
  showCanonicalDetails,
  practiceDiaryEnabled,
  noteCategories,
  styleOptions,
  composerProfile,
  composerProfileOptions,
  currentUserRole,
  startLearning,
  addToLearningList,
}: MobileTuneStateSectionProps) {
  const isAlreadyInPractice = Boolean(userPiece)
  const isKnown = Boolean(userKnownPiece)
  const currentStage = userPiece?.stage ?? null
  const existingListCount = Array.from(
    new Set((learningListItems ?? []).map((item) => item.learning_list_id))
  ).length
  const actionClassName = joinClasses(buttonStyles.secondary, "w-full")
  const primaryActionClassName = joinClasses(buttonStyles.primary, "w-full")

  if (!showTuneState && !showTuneReview && !showCanonicalDetails) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Practice and tune-detail sections are hidden in Display options.
      </p>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      {showTuneState ? (
        <MobileSection title="Tune status">
          <div className="divide-y divide-border">
            <StateRow
              label="Practice"
              value={isAlreadyInPractice ? "Already in practice" : "Not in practice"}
            />
            <StateRow label="Known" value={isKnown ? "Known" : "Not known"} />
            <StateRow label="Lists" value={String(existingListCount)} />
          </div>

          {isAlreadyInPractice && currentStage ? (
            <div className="mt-4">
              <PracticeProgress stage={currentStage} />
            </div>
          ) : null}

          <div className="mt-5 grid gap-2">
            {!isAlreadyInPractice ? (
              <StartPracticeButton
                pieceId={piece.id}
                redirectTo={redirectTo}
                startLearning={startLearning}
                className={primaryActionClassName}
              />
            ) : (
              <span className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-success bg-success px-4 py-2 text-sm font-medium text-success-foreground shadow-sm">
                Already in practice
              </span>
            )}

            {isAlreadyInPractice ? (
              <MarkAsKnownButton
                pieceId={piece.id}
                redirectTo={redirectTo}
                label="Set as known"
                className={actionClassName}
              />
            ) : isKnown ? (
              <p className="py-2 text-sm font-medium text-muted-foreground">
                Already marked known
              </p>
            ) : (
              <MarkAsKnownButton
                pieceId={piece.id}
                redirectTo={redirectTo}
                className={actionClassName}
              />
            )}

            <AddToListAction
              piece={piece}
              learningLists={learningLists}
              learningListItems={learningListItems}
              redirectTo={redirectTo}
              addToLearningList={addToLearningList}
              buttonClassName={actionClassName}
            />

            <RemoveTuneButton
              pieceId={piece.id}
              redirectTo={redirectTo}
              className={joinClasses(buttonStyles.destructiveSecondary, "w-full")}
            />
          </div>
        </MobileSection>
      ) : null}

      {showTuneReview ? (
        <TunePageReviewPanel
          piece={piece}
          userPiece={userPiece}
          redirectTo={redirectTo}
          practiceDiaryEnabled={practiceDiaryEnabled}
          noteCategories={noteCategories}
          variant="mobile"
        />
      ) : null}

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
    </div>
  )
}

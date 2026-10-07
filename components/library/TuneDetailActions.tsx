import MarkAsKnownButton from "@/components/MarkAsKnownButton"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import StartPracticeButton from "@/components/StartPracticeButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { Piece, UserKnownPiece, UserPiece } from "@/lib/types"
import { getReviewIntervalLabel } from "@/lib/review"

type TuneDetailActionsProps = {
  piece: Piece
  userPiece: UserPiece | null
  userKnownPiece: UserKnownPiece | null
  redirectTo: string
  startLearning: (formData: FormData) => Promise<void>
}

export default function TuneDetailActions({
  piece,
  userPiece,
  userKnownPiece,
  redirectTo,
  startLearning,
}: TuneDetailActionsProps) {
  const isAlreadyInPractice = Boolean(userPiece)
  const isKnown = Boolean(userKnownPiece)
  const currentStage = userPiece?.stage ?? null

  const tuneStateButtonSize =
    "min-h-[3.25rem] sm:!h-[3.25rem] sm:!w-[15rem] sm:!min-w-[15rem]"

  const tuneStatePrimaryActionClass = joinClasses(
    buttonStyles.primary,
    tuneStateButtonSize
  )

  const tuneStateActionClass = joinClasses(
    buttonStyles.secondary,
    tuneStateButtonSize
  )

  const tuneStatePracticeStatusClass = joinClasses(
    "inline-flex w-full items-center justify-center rounded-control border border-state-practice bg-state-practice px-4 py-2 text-sm font-medium text-state-practice-foreground sm:w-auto",
    tuneStateButtonSize
  )

  const tuneStateDestructiveActionClass = joinClasses(
    buttonStyles.destructiveSecondary,
    tuneStateButtonSize
  )

  const knownInertStatusClass =
    "flex min-h-[3.25rem] w-full flex-col justify-center border-l-2 border-state-known px-3 py-2 text-left sm:!w-[15rem] sm:!min-w-[15rem]"

  return (
    <section className="w-full max-w-full border-t border-hairline py-6">
      <h2 className="text-xl font-bold tracking-tight text-text-primary">
        My Practice
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Manage your practice state for this tune.
      </p>

      <div className="mt-5 grid min-w-0 divide-y divide-hairline border-y border-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="min-w-0 py-4 sm:px-4 sm:first:pl-0">
          <p className="text-xs font-semibold text-text-muted">
            Practice
          </p>
          <p className="mt-2 min-w-0 break-words text-lg font-semibold text-foreground">
            {isAlreadyInPractice ? "Already in practice" : "Not in practice"}
          </p>
        </div>

        <div className="min-w-0 py-4 sm:px-4">
          <p className="text-xs font-semibold text-text-muted">
            Known
          </p>
          <p className="mt-2 min-w-0 break-words text-lg font-semibold text-foreground">
            {isKnown ? "Known" : "Not known"}
          </p>
        </div>

        <div className="min-w-0 py-4 sm:px-4 sm:last:pr-0">
          <p className="text-xs font-semibold text-text-muted">
            Review interval
          </p>
          <p className="mt-2 min-w-0 break-words text-lg font-semibold text-foreground">
            {currentStage ? getReviewIntervalLabel(currentStage) : "No review interval"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        {!isAlreadyInPractice ? (
          <StartPracticeButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            startLearning={startLearning}
            className={tuneStatePrimaryActionClass}
          />
        ) : (
          <span className={tuneStatePracticeStatusClass}>
            Already in practice
          </span>
        )}

        {isAlreadyInPractice ? (
          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            label="Move to Known"
            confirmMessage={`Move "${piece.title}" to Known? Active Practice and review scheduling will stop.`}
            className={tuneStateActionClass}
          />
        ) : isKnown ? (
          <div className={knownInertStatusClass} role="status" aria-label="This tune is marked as known">
            <p className="text-xs font-semibold text-text-muted">
              Status
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Already marked known
            </p>
          </div>
        ) : (
          <MarkAsKnownButton
            pieceId={piece.id}
            redirectTo={redirectTo}
            className={tuneStateActionClass}
          />
        )}

        {isAlreadyInPractice && userPiece ? (
          <RemoveFromPracticeButton
            userPieceId={userPiece.id}
            redirectTo={redirectTo}
            className={tuneStateDestructiveActionClass}
          />
        ) : null}
      </div>
    </section>
  )
}

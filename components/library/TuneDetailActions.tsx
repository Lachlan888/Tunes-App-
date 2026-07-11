import MarkAsKnownButton from "@/components/MarkAsKnownButton"
import PracticeProgress from "@/components/practice/PracticeProgress"
import RemoveFromPracticeButton from "@/components/practice/RemoveFromPracticeButton"
import StartPracticeButton from "@/components/StartPracticeButton"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { Piece, UserKnownPiece, UserPiece } from "@/lib/types"

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
    "inline-flex w-full items-center justify-center rounded-full border border-success bg-success px-4 py-2 text-sm font-medium text-success-foreground shadow-sm sm:w-auto",
    tuneStateButtonSize
  )

  const tuneStateDestructiveActionClass = joinClasses(
    buttonStyles.destructiveSecondary,
    tuneStateButtonSize
  )

  const knownInertStatusClass =
    "flex min-h-[3.25rem] w-full flex-col justify-center rounded-2xl px-1 py-2 text-left sm:!w-[15rem] sm:!min-w-[15rem]"

  return (
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        My Practice
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Your personal state for this tune. Practice controls live here; broader
        tune management sits lower on the page.
      </p>

      <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Practice
          </p>
          <p className="mt-2 min-w-0 break-words text-lg font-semibold text-foreground">
            {isAlreadyInPractice ? "Already in practice" : "Not in practice"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Known
          </p>
          <p className="mt-2 min-w-0 break-words text-lg font-semibold text-foreground">
            {isKnown ? "Known" : "Not known"}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Stage
          </p>
          <p className="mt-2 min-w-0 break-words text-lg font-semibold text-foreground">
            {currentStage ? `Stage ${currentStage}` : "No active stage"}
          </p>
        </div>
      </div>

      {isAlreadyInPractice && currentStage ? (
        <div className="mt-5 min-w-0 rounded-2xl border border-border bg-background/70 p-4">
          <PracticeProgress stage={currentStage} />
        </div>
      ) : null}

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
          <div className={knownInertStatusClass} aria-label="This tune is marked as known">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
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

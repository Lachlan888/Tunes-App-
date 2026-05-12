"use client"

import { useEffect, useState } from "react"
import PendingLinkButton from "@/components/PendingLinkButton"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { LearningQueueTune } from "@/lib/loaders/lists"

type LearningQueueModalProps = {
  learningQueueTunes: LearningQueueTune[]
  startLearning: (formData: FormData) => Promise<void>
  redirectTo: string
  summaryClassName?: string
}

function formatAddedDate(value: string | null) {
  if (!value) return "Saved earlier"

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

function getListNamesText(listNames: string[]) {
  if (listNames.length === 0) return "No list"
  if (listNames.length === 1) return listNames[0]

  const [firstListName, ...remainingListNames] = listNames

  return `${firstListName} + ${remainingListNames.length} more`
}

export default function LearningQueueModal({
  learningQueueTunes,
  startLearning,
  redirectTo,
  summaryClassName = "rounded-2xl border border-border bg-card p-5 shadow-sm",
}: LearningQueueModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  if (learningQueueTunes.length === 0) {
    return null
  }

  const nextTune = learningQueueTunes[0]

  return (
    <>
      <section className={summaryClassName}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Learning Queue
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">
              Saved for later
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {learningQueueTunes.length} tune
              {learningQueueTunes.length === 1 ? "" : "s"} in your lists but
              not yet in Practice or Known.
            </p>

            {nextTune ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Next oldest:{" "}
                <span className="font-medium text-foreground">
                  {nextTune.piece.title}
                </span>{" "}
                from {nextTune.firstListName}.
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={buttonStyles.primary}
          >
            Open queue
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-foreground/35 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Learning Queue
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                    Saved for later
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    These tunes are in at least one of your lists, but they are
                    not yet in Practice or Known. Oldest saved tunes appear
                    first so old intentions do not disappear.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={buttonStyles.secondary}
                >
                  Close
                </button>
              </div>

              <ul className="space-y-3">
                {learningQueueTunes.map((queueTune) => {
                  const tuneTitle = queueTune.piece.title
                  const listText = getListNamesText(queueTune.listNames)

                  return (
                    <li
                      key={queueTune.piece.id}
                      className="rounded-2xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <PendingLinkButton
                            href={`/library/${queueTune.piece.id}`}
                            label={tuneTitle}
                            pendingLabel={`Opening ${tuneTitle}...`}
                            className="cursor-pointer text-left font-medium underline underline-offset-4"
                          />

                          <p className="mt-1 text-sm text-muted-foreground">
                            {[
                              queueTune.piece.key,
                              queueTune.piece.time_signature,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "No key or time signature set"}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            In: {listText}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            First saved:{" "}
                            {formatAddedDate(queueTune.firstAddedAt)}
                          </p>
                        </div>

                        <form action={startLearning}>
                          <input
                            type="hidden"
                            name="piece_id"
                            value={queueTune.piece.id}
                          />
                          <input
                            type="hidden"
                            name="redirect_to"
                            value={redirectTo}
                          />

                          <SubmitButton
                            label="Start Practice"
                            pendingLabel="Starting..."
                            className={buttonStyles.primary}
                          />
                        </form>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
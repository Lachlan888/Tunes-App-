"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import AddToListModal from "@/components/AddToListModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type {
  BadgeRequiredTune,
  BadgeViewerLearningList,
} from "@/lib/types"

type BadgeRequiredTunesSectionProps = {
  requiredTunes: BadgeRequiredTune[]
  viewerLearningLists: BadgeViewerLearningList[]
  redirectTo: string
  addToLearningList: (formData: FormData) => Promise<void>
}

function formatTuneMetadata(tune: BadgeRequiredTune["piece"]) {
  return [tune.key, tune.style, tune.time_signature].filter(Boolean).join(" · ")
}

function getStateLabel(tune: BadgeRequiredTune) {
  if (!tune.viewer_state) return "Log in to track"

  if (tune.viewer_state === "known") return "Known"

  if (tune.viewer_state === "in_practice") {
    return tune.stage ? `Already in practice · Stage ${tune.stage}` : "Already in practice"
  }

  return "Not in repertoire"
}

function getStateClass(tune: BadgeRequiredTune) {
  if (!tune.viewer_state) {
    return "border-border bg-background/70 text-muted-foreground"
  }

  if (tune.viewer_state === "known") {
    return "border-success bg-success text-success-foreground"
  }

  if (tune.viewer_state === "in_practice") {
    return "border-primary bg-primary text-primary-foreground"
  }

  return "border-border bg-background/70 text-muted-foreground"
}

export default function BadgeRequiredTunesSection({
  requiredTunes,
  viewerLearningLists,
  redirectTo,
  addToLearningList,
}: BadgeRequiredTunesSectionProps) {
  const [selectedTune, setSelectedTune] = useState<BadgeRequiredTune | null>(
    null
  )
  const [selectedListId, setSelectedListId] = useState("")

  const summary = useMemo(() => {
    return requiredTunes.reduce(
      (current, tune) => {
        if (tune.viewer_state === "known") {
          return {
            ...current,
            known: current.known + 1,
          }
        }

        if (tune.viewer_state === "in_practice") {
          return {
            ...current,
            inPractice: current.inPractice + 1,
          }
        }

        if (tune.viewer_state === "not_in_repertoire") {
          return {
            ...current,
            missing: current.missing + 1,
          }
        }

        return current
      },
      {
        known: 0,
        inPractice: 0,
        missing: 0,
      }
    )
  }, [requiredTunes])

  if (requiredTunes.length === 0) {
    return null
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Required tunes
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            These are the tunes this badge is built around. Open a tune page to
            inspect it, or add missing tunes to one of your lists.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
          <span className="rounded-full border border-success bg-success px-3 py-1 text-success-foreground">
            {summary.known} known
          </span>

          <span className="rounded-full border border-primary bg-primary px-3 py-1 text-primary-foreground">
            {summary.inPractice} in practice
          </span>

          <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-muted-foreground">
            {summary.missing} missing
          </span>
        </div>
      </div>

      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background/60">
        {requiredTunes.map((tune) => {
          const metadata = formatTuneMetadata(tune.piece)
          const canAddToList = tune.viewer_state !== null

          return (
            <li
              key={tune.piece.id}
              className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/library/${tune.piece.id}`}
                  className="text-base font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  {tune.piece.title}
                </Link>

                {metadata ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {metadata}
                  </p>
                ) : null}

                {tune.piece.reference_url ? (
                  <a
                    href={tune.piece.reference_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    data-card-action
                  >
                    Reference
                  </a>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${getStateClass(
                    tune
                  )}`}
                >
                  {getStateLabel(tune)}
                </span>

                {canAddToList ? (
                  <button
                    type="button"
                    className={buttonStyles.secondary}
                    onClick={() => {
                      setSelectedTune(tune)
                      setSelectedListId("")
                    }}
                  >
                    Add to List
                  </button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>

      {selectedTune ? (
        <AddToListModal
          selectedPiece={selectedTune.piece}
          selectedListId={selectedListId}
          learningLists={viewerLearningLists}
          existingListIds={selectedTune.existing_list_ids}
          redirectTo={redirectTo}
          addToLearningList={addToLearningList}
          onChangeSelectedListId={setSelectedListId}
          onClose={() => {
            setSelectedTune(null)
            setSelectedListId("")
          }}
        />
      ) : null}
    </section>
  )
}
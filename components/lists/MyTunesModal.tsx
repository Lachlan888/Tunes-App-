"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { buttonStyles } from "@/components/ui/buttonStyles"

type MyTuneRow = {
  piece_id: number
  title: string
  inPractice: boolean
  known: boolean
}

type MyTunesModalProps = {
  myTunes: MyTuneRow[]
}

function MyTuneLinkRow({
  tune,
  onNavigate,
}: {
  tune: MyTuneRow
  onNavigate: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          onNavigate()
          router.push(`/library/${tune.piece_id}`)
        })
      }}
      className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4 text-left shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="min-w-0">
        <div className="font-medium underline-offset-4 transition group-hover:underline">
          {isPending ? `Opening ${tune.title}...` : tune.title}
        </div>
        {!isPending && (
          <div className="mt-1 text-xs text-muted-foreground">
            Open tune page
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm">
        {tune.known && (
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Known
          </span>
        )}
        {tune.inPractice && (
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            In practice
          </span>
        )}
      </div>
    </button>
  )
}

export default function MyTunesModal({ myTunes }: MyTunesModalProps) {
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonStyles.secondary}
      >
        View My Tunes
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-foreground/35 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Repertoire
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                    My Tunes
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Known and active practice tunes.
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

              {myTunes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tunes yet.</p>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {myTunes.map((tune) => (
                      <MyTuneLinkRow
                        key={tune.piece_id}
                        tune={tune}
                        onNavigate={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
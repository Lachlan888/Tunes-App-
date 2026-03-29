"use client"

import { useEffect, useState } from "react"

type MyTuneRow = {
  piece_id: number
  title: string
  inPractice: boolean
  known: boolean
}

type MyTunesModalProps = {
  myTunes: MyTuneRow[]
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
        className="rounded border px-3 py-1 text-sm"
      >
        View My Tunes
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center py-8">
            <div
              className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">My Tunes</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Known and active learning tunes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Close
                </button>
              </div>

              {myTunes.length === 0 ? (
                <p className="text-sm text-gray-600">No tunes yet.</p>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {myTunes.map((tune) => (
                      <div
                        key={tune.piece_id}
                        className="flex items-center justify-between gap-4 rounded border p-3"
                      >
                        <div className="font-medium">{tune.title}</div>

                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {tune.known && (
                            <span className="rounded border px-2 py-1 text-gray-700">
                              Known
                            </span>
                          )}
                          {tune.inPractice && (
                            <span className="rounded border px-2 py-1 text-gray-700">
                              In practice
                            </span>
                          )}
                        </div>
                      </div>
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
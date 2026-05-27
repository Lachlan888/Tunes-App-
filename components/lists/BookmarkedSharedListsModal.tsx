"use client"

import Link from "next/link"
import { useState } from "react"
import SubmitButton from "@/components/SubmitButton"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import type { BookmarkedSharedListSummary } from "@/lib/loaders/lists"

type BookmarkedSharedListsModalProps = {
  bookmarkedSharedLists: BookmarkedSharedListSummary[]
  unbookmarkPublicList: (formData: FormData) => Promise<void>
  redirectTo: string
  summaryClassName?: string
  summaryVariant?: "card" | "compact"
  triggerClassName?: string
}

function tuneCountLabel(count: number) {
  return `${count} tune${count === 1 ? "" : "s"}`
}

export default function BookmarkedSharedListsModal({
  bookmarkedSharedLists,
  unbookmarkPublicList,
  redirectTo,
  summaryClassName = "rounded-2xl border border-border bg-card p-5 shadow-sm",
  summaryVariant = "card",
  triggerClassName,
}: BookmarkedSharedListsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isCompact = summaryVariant === "compact"
  const previewLists = bookmarkedSharedLists.slice(0, 3)

  if (isCompact) {
    return (
      <>
        <section className={summaryClassName}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex w-full items-center justify-between gap-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Bookmarked shared lists
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Open bookmarks <span aria-hidden="true">›</span>
              </p>
            </div>

            <p className="font-serif text-3xl font-bold leading-none text-foreground">
              {bookmarkedSharedLists.length}
            </p>
          </button>
        </section>

        <ResponsiveModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Bookmarked shared lists"
          description={
            bookmarkedSharedLists.length > 0
              ? "Shared lists you saved as references."
              : undefined
          }
          desktopMaxWidth="md:max-w-3xl"
          bodyClassName="min-h-0 min-w-0 flex-1 overflow-y-auto p-0"
        >
          {bookmarkedSharedLists.length === 0 ? (
            <div className="p-4 md:p-6">
              <p className="text-base font-semibold text-foreground">
                No bookmarked shared lists yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Bookmark shared lists to save them here as references.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {bookmarkedSharedLists.map((list) => (
                <li key={list.id} className="px-4 py-4 md:px-6">
                  <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <Link
                        href={`/public-lists/${list.id}`}
                        className="text-base font-semibold text-foreground underline underline-offset-4 transition hover:text-primary"
                      >
                        {list.name}
                      </Link>

                      <p className="mt-1 text-sm text-muted-foreground">
                        By {list.ownerLabel} · {tuneCountLabel(list.tuneCount)}
                      </p>

                      {list.description ? (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {list.description}
                        </p>
                      ) : null}
                    </div>

                    <form action={unbookmarkPublicList} className="shrink-0">
                      <input
                        type="hidden"
                        name="learning_list_id"
                        value={list.id}
                      />
                      <input
                        type="hidden"
                        name="redirect_to"
                        value={redirectTo}
                      />
                      <SubmitButton
                        label="Remove bookmark"
                        pendingLabel="Removing..."
                        className={joinClasses(
                          buttonStyles.secondary,
                          "min-h-10 w-full md:w-auto"
                        )}
                      />
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ResponsiveModal>
      </>
    )
  }

  return (
    <>
      <section className={summaryClassName}>
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Bookmarked shared lists
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {bookmarkedSharedLists.length} shared list
              {bookmarkedSharedLists.length === 1 ? "" : "s"} bookmarked as
              reference material.
            </p>

            {previewLists.length > 0 ? (
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                Recent:{" "}
                <span className="font-medium text-foreground">
                  {previewLists.map((list) => list.name).join(", ")}
                </span>
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={triggerClassName ?? buttonStyles.primary}
          >
            Open bookmarks
          </button>
        </div>
      </section>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Bookmarked shared lists"
        description={
          bookmarkedSharedLists.length > 0
            ? "Shared lists you saved as references."
            : undefined
        }
        desktopMaxWidth="md:max-w-3xl"
        bodyClassName="min-h-0 min-w-0 flex-1 overflow-y-auto p-0"
      >
        {bookmarkedSharedLists.length === 0 ? (
          <div className="p-4 md:p-6">
            <p className="text-base font-semibold text-foreground">
              No bookmarked shared lists yet.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Bookmark shared lists to save them here as references.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {bookmarkedSharedLists.map((list) => (
              <li key={list.id} className="px-4 py-4 md:px-6">
                <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/public-lists/${list.id}`}
                      className="text-base font-semibold text-foreground underline underline-offset-4 transition hover:text-primary"
                    >
                      {list.name}
                    </Link>

                    <p className="mt-1 text-sm text-muted-foreground">
                      By {list.ownerLabel} · {tuneCountLabel(list.tuneCount)}
                    </p>

                    {list.description ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {list.description}
                      </p>
                    ) : null}
                  </div>

                  <form
                    action={unbookmarkPublicList}
                    className="shrink-0"
                  >
                    <input
                      type="hidden"
                      name="learning_list_id"
                      value={list.id}
                    />
                    <input type="hidden" name="redirect_to" value={redirectTo} />
                    <SubmitButton
                      label="Remove bookmark"
                      pendingLabel="Removing..."
                      className={joinClasses(
                        buttonStyles.secondary,
                        "min-h-10 w-full md:w-auto"
                      )}
                    />
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ResponsiveModal>
    </>
  )
}

"use client"

import { useState } from "react"
import PracticeCategoryManager from "@/components/practice-diary/PracticeCategoryManager"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import type { PracticeNoteCategory } from "@/lib/loaders/practice-diary"

type PracticeCategoryManagerModalProps = {
  categories: PracticeNoteCategory[]
  redirectTo: string
}

export default function PracticeCategoryManagerModal({
  categories,
  redirectTo,
}: PracticeCategoryManagerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:rounded-3xl md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground md:text-sm">
              Practice categories
            </p>

            <p className="mt-2 hidden text-sm leading-6 text-muted-foreground md:block">
              Manage note categories for tempo, form, technique, variations, or
              any other practice lens.
            </p>
          </div>

          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={() => setIsOpen(true)}
          >
            Manage categories
          </button>
        </div>
      </section>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-3xl"
        eyebrow="Practice diary"
        title="Manage categories"
        bodyClassName="min-h-0 flex-1 overflow-y-auto p-4 md:p-6"
      >
        <PracticeCategoryManager
          categories={categories}
          redirectTo={redirectTo}
        />
      </ResponsiveModal>
    </>
  )
}
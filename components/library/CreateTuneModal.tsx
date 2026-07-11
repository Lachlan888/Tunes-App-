"use client"

import { useState } from "react"
import CreateTuneForm from "@/components/library/CreateTuneForm"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles, joinClasses } from "@/components/ui/buttonStyles"
import { createTune } from "@/lib/actions/pieces"

type StyleOption = {
  id: number
  slug: string
  label: string
}

type CreateTuneModalProps = {
  styleOptions: StyleOption[]
}

export default function CreateTuneModal({
  styleOptions,
}: CreateTuneModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleClose() {
    if (isSubmitting) return

    setIsOpen(false)
  }

  function handleOpen() {
    setIsSubmitting(false)
    setIsOpen(true)
  }

  return (
    <section className="w-full md:w-auto">
      <button
        type="button"
        onClick={handleOpen}
        className={joinClasses(buttonStyles.primary, "w-full md:w-auto")}
      >
        Create tune
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={handleClose}
        closeDisabled={isSubmitting}
        closeOnOverlayClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-5xl"
        eyebrow="Catalogue"
        title="Create tune"
        description="Create the basic shared tune record. You can add media, notes, lists and Practice details on the tune page."
        bodyClassName="flex min-h-0 flex-1 p-0"
      >
        <CreateTuneForm
          createTune={createTune}
          styleOptions={styleOptions}
          redirectTo="/library"
          onSubmitStart={() => setIsSubmitting(true)}
        />
      </ResponsiveModal>
    </section>
  )
}

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

type LearningListOption = {
  id: number
  name: string
}

type CreateTuneModalProps = {
  styleOptions: StyleOption[]
  learningLists: LearningListOption[]
}

export default function CreateTuneModal({
  styleOptions,
  learningLists,
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
        Create Tune
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={handleClose}
        closeDisabled={isSubmitting}
        closeOnOverlayClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
        mobileMode="full-screen"
        desktopMaxWidth="md:max-w-4xl"
        eyebrow="Catalogue"
        title="Create Tune"
        description="Add a tune to the shared catalogue, then optionally place it straight into your own repertoire workflow."
        bodyClassName="flex min-h-0 flex-1 overflow-hidden p-0"
      >
        <CreateTuneForm
          createTune={createTune}
          styleOptions={styleOptions}
          learningLists={learningLists}
          redirectTo="/library"
          onSubmitStart={() => setIsSubmitting(true)}
        />
      </ResponsiveModal>
    </section>
  )
}
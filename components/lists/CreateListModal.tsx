"use client"

import { useState } from "react"
import CreateListForm from "@/components/lists/CreateListForm"
import ResponsiveModal from "@/components/ui/ResponsiveModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { createList } from "@/lib/actions/lists"

export default function CreateListModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleOpen() {
    setIsSubmitting(false)
    setIsOpen(true)
  }

  function handleClose() {
    if (isSubmitting) return

    setIsOpen(false)
  }

  return (
    <section>
      <button type="button" onClick={handleOpen} className={buttonStyles.primary}>
        Create List
      </button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={handleClose}
        closeDisabled={isSubmitting}
        closeOnOverlayClick={!isSubmitting}
        closeOnEscape={!isSubmitting}
        mobileMode="sheet"
        desktopMaxWidth="md:max-w-xl"
        eyebrow="Lists"
        title="Create List"
        description="Make a container for repertoire, practice plans, session sets, or imported tune groups."
      >
        <CreateListForm
          createList={createList}
          redirectTo="/learning-lists"
          onSubmitStart={() => setIsSubmitting(true)}
        />
      </ResponsiveModal>
    </section>
  )
}
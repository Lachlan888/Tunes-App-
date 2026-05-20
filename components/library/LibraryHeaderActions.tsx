import BulkImportKnownTunesModal from "@/components/library/BulkImportKnownTunesModal"
import CreateTuneModal from "@/components/library/CreateTuneModal"
import type { LearningList, StyleOption } from "@/lib/types"

type LibraryHeaderActionsProps = {
  styleOptions: StyleOption[]
  learningLists: LearningList[]
}

export default function LibraryHeaderActions({
  styleOptions,
  learningLists,
}: LibraryHeaderActionsProps) {
  return (
    <div className="mb-6 grid gap-3 md:mb-8 md:flex md:flex-wrap md:items-center">
      <CreateTuneModal
        styleOptions={styleOptions}
        learningLists={learningLists}
      />

      <div className="hidden md:block">
        <BulkImportKnownTunesModal />
      </div>
    </div>
  )
}
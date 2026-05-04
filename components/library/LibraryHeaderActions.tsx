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
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <CreateTuneModal
        styleOptions={styleOptions}
        learningLists={learningLists}
      />
      <BulkImportKnownTunesModal />
    </div>
  )
}
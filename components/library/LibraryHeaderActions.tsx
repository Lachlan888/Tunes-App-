import BulkImportKnownTunesModal from "@/components/library/BulkImportKnownTunesModal"
import CreateTuneModal from "@/components/library/CreateTuneModal"
import type { StyleOption } from "@/lib/types"

type LibraryHeaderActionsProps = {
  styleOptions: StyleOption[]
}

export default function LibraryHeaderActions({
  styleOptions,
}: LibraryHeaderActionsProps) {
  return (
    <div className="mb-6 grid gap-3 md:mb-8 md:flex md:flex-wrap md:items-center">
      <CreateTuneModal styleOptions={styleOptions} />

      <div className="hidden md:block">
        <BulkImportKnownTunesModal />
      </div>
    </div>
  )
}

type ListsStatusMessagesProps = {
  createListStatus: string
  editListStatus: string
}

function StatusBanner({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error"
  children: React.ReactNode
}) {
  const toneClassNames = {
    success: "border-success bg-[#e6edd6] text-[#435336]",
    warning: "border-[#c5ad67] bg-[#f1e7bf] text-[#675622]",
    error: "border-destructive bg-[#f2dfd6] text-[#6f3f36]",
  }

  return (
    <div
      className={`mb-6 rounded-2xl border p-4 text-sm font-medium shadow-sm ${toneClassNames[tone]}`}
    >
      {children}
    </div>
  )
}

export default function ListsStatusMessages({
  createListStatus,
  editListStatus,
}: ListsStatusMessagesProps) {
  return (
    <>
      {createListStatus === "success" && (
        <StatusBanner tone="success">List created.</StatusBanner>
      )}

      {createListStatus === "missing_name" && (
        <StatusBanner tone="warning">Please enter a list name.</StatusBanner>
      )}

      {createListStatus === "invalid_visibility" && (
        <StatusBanner tone="warning">Invalid list visibility.</StatusBanner>
      )}

      {createListStatus === "error" && (
        <StatusBanner tone="error">Could not create list.</StatusBanner>
      )}

      {editListStatus === "success" && (
        <StatusBanner tone="success">List updated.</StatusBanner>
      )}

      {editListStatus === "removed_tune" && (
        <StatusBanner tone="success">
          Tune removed from this list.
        </StatusBanner>
      )}

      {editListStatus === "deleted" && (
        <StatusBanner tone="success">List deleted.</StatusBanner>
      )}

      {editListStatus === "missing_list" && (
        <StatusBanner tone="warning">
          Could not tell which list to edit.
        </StatusBanner>
      )}

      {editListStatus === "missing_name" && (
        <StatusBanner tone="warning">Please enter a list name.</StatusBanner>
      )}

      {editListStatus === "missing_item" && (
        <StatusBanner tone="warning">
          Could not tell which tune to remove from the list.
        </StatusBanner>
      )}

      {editListStatus === "invalid_visibility" && (
        <StatusBanner tone="warning">Invalid list visibility.</StatusBanner>
      )}

      {editListStatus === "not_found" && (
        <StatusBanner tone="error">
          List not found or you do not own it.
        </StatusBanner>
      )}

      {editListStatus === "error" && (
        <StatusBanner tone="error">Could not update list.</StatusBanner>
      )}
    </>
  )
}
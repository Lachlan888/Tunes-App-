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
    success: "border-green-600 bg-green-50 text-green-800",
    warning: "border-yellow-600 bg-yellow-50 text-yellow-800",
    error: "border-red-600 bg-red-50 text-red-800",
  }

  return (
    <div className={`mb-6 rounded border p-3 text-sm ${toneClassNames[tone]}`}>
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
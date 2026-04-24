type PracticeStatusMessagesProps = {
  practiceUpdate: string
  removeFromPracticeStatus: string
}

function StatusBox({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error"
  children: React.ReactNode
}) {
  const classes = {
    success: "border-green-600 bg-green-50 text-green-800",
    warning: "border-yellow-600 bg-yellow-50 text-yellow-800",
    error: "border-red-600 bg-red-50 text-red-800",
  }

  return (
    <div className={`mb-6 mt-4 rounded border p-3 text-sm ${classes[tone]}`}>
      {children}
    </div>
  )
}

export default function PracticeStatusMessages({
  practiceUpdate,
  removeFromPracticeStatus,
}: PracticeStatusMessagesProps) {
  return (
    <>
      {practiceUpdate === "moved_to_known" && (
        <StatusBox tone="success">
          Tune completed its final practice review and moved to known tunes.
        </StatusBox>
      )}

      {removeFromPracticeStatus === "success" && (
        <StatusBox tone="success">Tune removed from practice.</StatusBox>
      )}

      {removeFromPracticeStatus === "missing_user_piece" && (
        <StatusBox tone="warning">
          Could not tell which practice item to remove.
        </StatusBox>
      )}

      {removeFromPracticeStatus === "not_found" && (
        <StatusBox tone="warning">That practice item no longer exists.</StatusBox>
      )}

      {removeFromPracticeStatus === "error" && (
        <StatusBox tone="error">Could not remove tune from practice.</StatusBox>
      )}
    </>
  )
}
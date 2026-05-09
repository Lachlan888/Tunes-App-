import { statusStyles, type StatusTone } from "@/components/ui/statusStyles"

type PracticeStatusMessagesProps = {
  practiceUpdate: string
  removeFromPracticeStatus: string
}

function StatusBox({
  tone,
  children,
}: {
  tone: StatusTone
  children: React.ReactNode
}) {
  return (
    <div
      className={`mb-6 mt-4 rounded-xl border p-3 text-sm font-medium ${statusStyles[tone]}`}
    >
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
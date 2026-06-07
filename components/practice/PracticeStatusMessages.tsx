import { statusStyles, type StatusTone } from "@/components/ui/statusStyles"

type PracticeStatusMessagesProps = {
  practiceUpdate: string
  removeFromPracticeStatus: string
  loopStatus: string
  preferredReferenceStatus: string
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
  loopStatus,
  preferredReferenceStatus,
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
          Couldn’t tell which practice item to remove.
        </StatusBox>
      )}

      {removeFromPracticeStatus === "not_found" && (
        <StatusBox tone="warning">That practice item no longer exists.</StatusBox>
      )}

      {removeFromPracticeStatus === "error" && (
        <StatusBox tone="error">Couldn’t remove tune from practice.</StatusBox>
      )}

      {loopStatus === "saved" && (
        <StatusBox tone="success">Loop saved.</StatusBox>
      )}

      {loopStatus === "deleted" && (
        <StatusBox tone="success">Loop deleted.</StatusBox>
      )}

      {loopStatus === "missing_fields" && (
        <StatusBox tone="warning">
          Couldn’t save loop: missing label or video.
        </StatusBox>
      )}

      {loopStatus === "invalid_range" && (
        <StatusBox tone="warning">
          Couldn’t save loop: choose a valid start and end point.
        </StatusBox>
      )}

      {loopStatus === "missing_loop" && (
        <StatusBox tone="warning">Couldn’t find that saved loop.</StatusBox>
      )}

      {loopStatus === "missing_piece" && (
        <StatusBox tone="warning">Couldn’t find that tune.</StatusBox>
      )}

      {loopStatus === "error" && (
        <StatusBox tone="error">Couldn’t update loop.</StatusBox>
      )}

      {preferredReferenceStatus === "saved" && (
        <StatusBox tone="success">Preferred reference saved.</StatusBox>
      )}

      {preferredReferenceStatus === "invalid_url" && (
        <StatusBox tone="warning">
          That does not look like a valid URL.
        </StatusBox>
      )}

      {preferredReferenceStatus === "not_youtube" && (
        <StatusBox tone="warning">
          Preferred references must be YouTube links for now.
        </StatusBox>
      )}

      {preferredReferenceStatus === "error" && (
        <StatusBox tone="error">
          Couldn’t update preferred reference.
        </StatusBox>
      )}
    </>
  )
}

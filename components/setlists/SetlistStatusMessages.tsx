type SetlistStatusMessagesProps = {
  setlistStatus?: string
  inviteStatus?: string
  itemStatus?: string
}

function statusClass(tone: "success" | "warning" | "error" | "neutral") {
  if (tone === "success") {
    return "border-success bg-success text-success-foreground"
  }

  if (tone === "warning") {
    return "border-warning-strong bg-muted text-foreground"
  }

  if (tone === "error") {
    return "border-destructive bg-muted text-destructive"
  }

  return "border-border bg-muted text-muted-foreground"
}

function StatusBanner({
  tone,
  children,
}: {
  tone: "success" | "warning" | "error" | "neutral"
  children: React.ReactNode
}) {
  const isSuccess = tone === "success"

  return (
    <div
      className={`mb-6 border text-sm font-medium shadow-sm ${statusClass(
        tone
      )} ${
        isSuccess
          ? "inline-flex rounded-full px-4 py-2"
          : "rounded-2xl p-4"
      }`}
    >
      {children}
    </div>
  )
}

export default function SetlistStatusMessages({
  setlistStatus = "",
  inviteStatus = "",
  itemStatus = "",
}: SetlistStatusMessagesProps) {
  return (
    <>
      {setlistStatus === "created" ? (
        <StatusBanner tone="success">Setlist created.</StatusBanner>
      ) : null}

      {setlistStatus === "updated" ? (
        <StatusBanner tone="success">Setlist updated.</StatusBanner>
      ) : null}

      {setlistStatus === "deleted" ? (
        <StatusBanner tone="success">Setlist deleted.</StatusBanner>
      ) : null}

      {setlistStatus === "missing_setlist" ? (
        <StatusBanner tone="warning">
          Could not tell which setlist to update.
        </StatusBanner>
      ) : null}

      {setlistStatus === "missing_name" ? (
        <StatusBanner tone="warning">Enter a setlist name.</StatusBanner>
      ) : null}

      {setlistStatus === "not_found" ? (
        <StatusBanner tone="error">
          That setlist could not be found.
        </StatusBanner>
      ) : null}

      {setlistStatus === "creator_only" ? (
        <StatusBanner tone="warning">
          Only the creator can delete this setlist in this version.
        </StatusBanner>
      ) : null}

      {setlistStatus === "forbidden" ? (
        <StatusBanner tone="error">
          You do not have permission to edit this setlist.
        </StatusBanner>
      ) : null}

      {setlistStatus === "error" ? (
        <StatusBanner tone="error">Could not update the setlist.</StatusBanner>
      ) : null}

      {inviteStatus === "sent" ? (
        <StatusBanner tone="success">Setlist invitation sent.</StatusBanner>
      ) : null}

      {inviteStatus === "accepted" ? (
        <StatusBanner tone="success">
          Setlist invitation accepted.
        </StatusBanner>
      ) : null}

      {inviteStatus === "declined" ? (
        <StatusBanner tone="neutral">
          Setlist invitation declined.
        </StatusBanner>
      ) : null}

      {inviteStatus === "missing_setlist" ? (
        <StatusBanner tone="warning">
          Could not tell which setlist to invite someone to.
        </StatusBanner>
      ) : null}

      {inviteStatus === "missing_invite" ? (
        <StatusBanner tone="warning">
          Could not tell which invitation to update.
        </StatusBanner>
      ) : null}

      {inviteStatus === "missing_user" ? (
        <StatusBanner tone="warning">Choose a friend to invite.</StatusBanner>
      ) : null}

      {inviteStatus === "self" ? (
        <StatusBanner tone="warning">
          You are already in this setlist.
        </StatusBanner>
      ) : null}

      {inviteStatus === "not_friend" ? (
        <StatusBanner tone="warning">
          You can only invite accepted friends to a setlist.
        </StatusBanner>
      ) : null}

      {inviteStatus === "not_found" ? (
        <StatusBanner tone="error">
          That invitation could not be found.
        </StatusBanner>
      ) : null}

      {inviteStatus === "duplicate" ? (
        <StatusBanner tone="neutral">
          That friend is already invited or already in this setlist.
        </StatusBanner>
      ) : null}

      {inviteStatus === "forbidden" ? (
        <StatusBanner tone="error">
          You do not have permission to invite collaborators.
        </StatusBanner>
      ) : null}

      {inviteStatus === "invalid_status" ? (
        <StatusBanner tone="warning">
          That invitation is no longer pending.
        </StatusBanner>
      ) : null}

      {inviteStatus === "error" ? (
        <StatusBanner tone="error">Could not update invitation.</StatusBanner>
      ) : null}

      {itemStatus === "added" ? (
        <StatusBanner tone="success">Tune added to setlist.</StatusBanner>
      ) : null}

      {itemStatus === "duplicate" ? (
        <StatusBanner tone="neutral">
          That tune is already in this setlist.
        </StatusBanner>
      ) : null}

      {itemStatus === "updated" ? (
        <StatusBanner tone="success">Setlist tune updated.</StatusBanner>
      ) : null}

      {itemStatus === "removed" ? (
        <StatusBanner tone="success">Tune removed from setlist.</StatusBanner>
      ) : null}

      {itemStatus === "moved" ? (
        <StatusBanner tone="success">Setlist order updated.</StatusBanner>
      ) : null}

      {itemStatus === "invalid_move" ? (
        <StatusBanner tone="warning">Invalid move request.</StatusBanner>
      ) : null}

      {itemStatus === "not_found" ? (
        <StatusBanner tone="error">
          That setlist tune could not be found.
        </StatusBanner>
      ) : null}

      {itemStatus === "missing_item" ? (
        <StatusBanner tone="warning">
          Could not tell which tune to update.
        </StatusBanner>
      ) : null}

      {itemStatus === "forbidden" ? (
        <StatusBanner tone="error">
          You do not have permission to edit this setlist.
        </StatusBanner>
      ) : null}

      {itemStatus === "error" ? (
        <StatusBanner tone="error">
          Could not update setlist tune.
        </StatusBanner>
      ) : null}
    </>
  )
}
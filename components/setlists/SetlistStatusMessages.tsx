type SetlistStatusMessagesProps = {
  setlistStatus?: string
  inviteStatus?: string
  itemStatus?: string
}

type MessageTone = "success" | "warning" | "error"

type Message = {
  key: string
  text: string
  tone: MessageTone
}

function toneClassName(tone: MessageTone) {
  if (tone === "success") {
    return "border-success bg-card text-foreground"
  }

  if (tone === "warning") {
    return "border-warning bg-card text-foreground"
  }

  return "border-destructive bg-card text-foreground"
}

function getSetlistMessage(status: string | undefined): Message | null {
  if (!status) return null

  const messages: Record<string, Message> = {
    created: {
      key: "setlist-created",
      text: "Setlist created.",
      tone: "success",
    },
    updated: {
      key: "setlist-updated",
      text: "Setlist updated.",
      tone: "success",
    },
    deleted: {
      key: "setlist-deleted",
      text: "Setlist deleted.",
      tone: "success",
    },
    missing_name: {
      key: "setlist-missing-name",
      text: "Setlist name is required.",
      tone: "warning",
    },
    missing_setlist: {
      key: "setlist-missing-setlist",
      text: "Could not find the setlist.",
      tone: "error",
    },
    not_found: {
      key: "setlist-not-found",
      text: "That setlist could not be found.",
      tone: "error",
    },
    forbidden: {
      key: "setlist-forbidden",
      text: "You do not have permission to edit that setlist.",
      tone: "error",
    },
    creator_only: {
      key: "setlist-creator-only",
      text: "Only the setlist creator can delete this setlist.",
      tone: "error",
    },
    error: {
      key: "setlist-error",
      text: "Something went wrong with the setlist action.",
      tone: "error",
    },
  }

  return messages[status] ?? null
}

function getInviteMessage(status: string | undefined): Message | null {
  if (!status) return null

  const messages: Record<string, Message> = {
    sent: {
      key: "invite-sent",
      text: "Invitation sent.",
      tone: "success",
    },
    accepted: {
      key: "invite-accepted",
      text: "Invitation accepted.",
      tone: "success",
    },
    declined: {
      key: "invite-declined",
      text: "Invitation declined.",
      tone: "success",
    },
    missing_setlist: {
      key: "invite-missing-setlist",
      text: "Could not find the setlist for that invitation.",
      tone: "error",
    },
    missing_user: {
      key: "invite-missing-user",
      text: "Choose someone to invite.",
      tone: "warning",
    },
    missing_invite: {
      key: "invite-missing-invite",
      text: "Could not find that invitation.",
      tone: "error",
    },
    self: {
      key: "invite-self",
      text: "You are already on this setlist.",
      tone: "warning",
    },
    not_friend: {
      key: "invite-not-friend",
      text: "You can only invite accepted friends to a setlist.",
      tone: "warning",
    },
    duplicate: {
      key: "invite-duplicate",
      text: "That user has already been invited to this setlist.",
      tone: "warning",
    },
    invalid_status: {
      key: "invite-invalid-status",
      text: "That invitation is no longer pending.",
      tone: "warning",
    },
    not_found: {
      key: "invite-not-found",
      text: "That invitation could not be found.",
      tone: "error",
    },
    forbidden: {
      key: "invite-forbidden",
      text: "You do not have permission to manage that invitation.",
      tone: "error",
    },
    error: {
      key: "invite-error",
      text: "Something went wrong with the invitation.",
      tone: "error",
    },
  }

  return messages[status] ?? null
}

function getItemMessage(status: string | undefined): Message | null {
  if (!status) return null

  const messages: Record<string, Message> = {
    added: {
      key: "item-added",
      text: "Tune added to setlist.",
      tone: "success",
    },
    updated: {
      key: "item-updated",
      text: "Tune details updated.",
      tone: "success",
    },
    removed: {
      key: "item-removed",
      text: "Tune removed from setlist.",
      tone: "success",
    },
    moved: {
      key: "item-moved",
      text: "Setlist order updated.",
      tone: "success",
    },
    duplicate: {
      key: "item-duplicate",
      text: "That tune is already in this setlist.",
      tone: "warning",
    },
    missing_item: {
      key: "item-missing-item",
      text: "Could not find the tune or setlist item.",
      tone: "error",
    },
    invalid_move: {
      key: "item-invalid-move",
      text: "Could not move that tune.",
      tone: "warning",
    },
    not_found: {
      key: "item-not-found",
      text: "That setlist item could not be found.",
      tone: "error",
    },
    forbidden: {
      key: "item-forbidden",
      text: "You do not have permission to edit that setlist item.",
      tone: "error",
    },
    error: {
      key: "item-error",
      text: "Something went wrong with the setlist item action.",
      tone: "error",
    },
  }

  return messages[status] ?? null
}

export default function SetlistStatusMessages({
  setlistStatus,
  inviteStatus,
  itemStatus,
}: SetlistStatusMessagesProps) {
  const messages = [
    getSetlistMessage(setlistStatus),
    getInviteMessage(inviteStatus),
    getItemMessage(itemStatus),
  ].filter((message): message is Message => Boolean(message))

  if (messages.length === 0) {
    return null
  }

  return (
    <div className="mb-6 space-y-3">
      {messages.map((message) => (
        <div
          key={message.key}
          className={`rounded-2xl border p-4 text-sm font-medium shadow-sm ${toneClassName(
            message.tone
          )}`}
        >
          {message.text}
        </div>
      ))}
    </div>
  )
}
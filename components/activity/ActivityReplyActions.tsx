"use client"

import { useEffect, useRef, useState } from "react"
import ContextActionMenu from "@/components/ui/ContextActionMenu"
import SubmitButton from "@/components/SubmitButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
import { deleteActivityReply, updateActivityReply } from "@/lib/actions/activity-interactions"

export default function ActivityReplyActions({ id, body, redirectTo }: { id: number; body: string; redirectTo: string }) {
  const [editing, setEditing] = useState(false)
  const editFieldRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) editFieldRef.current?.focus()
  }, [editing])

  return <div className="w-full">
    <ContextActionMenu
      label="More actions for your reply"
      title="Your reply"
      actions={[
        { id: "edit", label: "Edit reply", onSelect: () => setEditing(true), completionMessage: null },
        {
          id: "delete",
          label: "Delete reply",
          destructive: true,
          confirmMessage: "Delete this reply?",
          onSelect: async () => {
            const data = new FormData()
            data.set("activity_reply_id", String(id))
            data.set("redirect_to", redirectTo)
            await deleteActivityReply(data)
          },
        },
      ]}
    />
    {editing ? <form action={updateActivityReply} className="mt-3 space-y-2">
      <input type="hidden" name="activity_reply_id" value={id} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <label className="block text-sm font-medium text-text-primary" htmlFor={`reply-edit-${id}`}>Edit reply</label>
      <textarea ref={editFieldRef} id={`reply-edit-${id}`} name="body" rows={3} defaultValue={body} required className="w-full rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" />
      <div className="flex flex-wrap gap-2">
        <SubmitButton label="Save edit" pendingLabel="Saving..." className={buttonStyles.primary} />
        <button type="button" className={buttonStyles.secondary} onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </form> : null}
  </div>
}

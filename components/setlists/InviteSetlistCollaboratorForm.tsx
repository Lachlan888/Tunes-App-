import SubmitButton from "@/components/SubmitButton"
import type { SetlistInviteOption } from "@/lib/types"

type InviteSetlistCollaboratorFormProps = {
  setlistId: number
  redirectTo: string
  inviteOptions: SetlistInviteOption[]
  inviteSetlistCollaborator: (formData: FormData) => Promise<void>
}

function friendLabel(friend: SetlistInviteOption) {
  const name = friend.display_name || friend.username || "Unnamed user"
  return friend.username ? `${name} (@${friend.username})` : name
}

export default function InviteSetlistCollaboratorForm({
  setlistId,
  redirectTo,
  inviteOptions,
  inviteSetlistCollaborator,
}: InviteSetlistCollaboratorFormProps) {
  return (
    <form
      action={inviteSetlistCollaborator}
      className="w-full max-w-md rounded-2xl border border-border bg-background/70 p-4 shadow-sm"
    >
      <input type="hidden" name="setlist_id" value={setlistId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="text-sm font-medium text-foreground">
        Invite collaborator
      </label>

      {inviteOptions.length === 0 ? (
        <p className="mt-2 rounded-xl border border-border bg-card p-3 text-sm leading-6 text-muted-foreground">
          No available friends to invite. Friends already in this setlist or
          already invited are hidden here.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <select
            name="collaborator_user_id"
            required
            className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
          >
            <option value="">Choose a friend</option>
            {inviteOptions.map((friend) => (
              <option key={friend.user_id} value={friend.user_id}>
                {friendLabel(friend)}
              </option>
            ))}
          </select>

          <SubmitButton
            label="Invite"
            pendingLabel="Inviting..."
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
      )}

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Only accepted friends appear here. Invited users receive an Inbox
        notification and can accept from the Setlists page.
      </p>
    </form>
  )
}
import SubmitButton from "@/components/SubmitButton"
import type { SetlistInviteOption } from "@/lib/types"

type InviteSetlistCollaboratorFormProps = {
  setlistId: number
  redirectTo: string
  inviteOptions: SetlistInviteOption[]
  inviteSetlistCollaborator: (formData: FormData) => Promise<void>
}

function friendLabel(friend: SetlistInviteOption) {
  const name = friend.display_name || friend.username || "Unnamed player"
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
      className="min-w-0 border-t border-hairline pt-5"
    >
      <input type="hidden" name="setlist_id" value={setlistId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label htmlFor={`setlist-${setlistId}-collaborator`} className="text-sm font-medium text-foreground">
        Invite collaborator
      </label>

      {inviteOptions.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          No available friends to invite. Friends already in this setlist or
          already invited are hidden here.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2 xl:flex-row">
          <select
            id={`setlist-${setlistId}-collaborator`}
            name="collaborator_user_id"
            required
            className="min-h-11 min-w-0 flex-1 rounded-control border border-hairline bg-surface-paper px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-[var(--focus-ring)]"
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
            className="min-h-11 inline-flex items-center justify-center rounded-control border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
      )}

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Only accepted friends appear here. Invited friends receive an Inbox
        notification and can accept from the Setlists page.
      </p>
    </form>
  )
}

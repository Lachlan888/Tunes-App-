import InviteSetlistCollaboratorForm from "@/components/setlists/InviteSetlistCollaboratorForm"
import UserIdentityLink from "@/components/UserIdentityLink"
import type { SetlistInviteOption, SetlistMember } from "@/lib/types"

type SetlistCollaboratorsSectionProps = {
  setlistId: number
  acceptedMembers: SetlistMember[]
  pendingMembers: SetlistMember[]
  canEdit: boolean
  redirectTo: string
  inviteOptions: SetlistInviteOption[]
  inviteSetlistCollaborator: (formData: FormData) => Promise<void>
}

function memberLabel(member: SetlistMember) {
  return member.profile?.display_name || member.profile?.username || "Unknown"
}

function MemberRow({
  member,
  status,
}: {
  member: SetlistMember
  status: "accepted" | "pending"
}) {
  const className = status === "accepted"
    ? "block border-l-2 border-success py-2 pl-3 text-sm font-medium text-foreground"
    : "block border-l-2 border-warning py-2 pl-3 text-sm font-medium text-muted-foreground"

  return (
    <span className={className}>
      {status === "pending" ? "Pending: " : ""}

      {member.profile?.username ? (
        <UserIdentityLink
          username={member.profile.username}
          displayName={member.profile.display_name}
          fallbackLabel="Unknown"
          className="underline underline-offset-4 transition hover:text-foreground"
        />
      ) : (
        memberLabel(member)
      )}
    </span>
  )
}

export default function SetlistCollaboratorsSection({
  setlistId,
  acceptedMembers,
  pendingMembers,
  canEdit,
  redirectTo,
  inviteOptions,
  inviteSetlistCollaborator,
}: SetlistCollaboratorsSectionProps) {
  return (
    <section className="border-t border-hairline pt-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Collaborators
          </h2>

          <div className="mt-4 divide-y divide-hairline border-y border-hairline">
            {acceptedMembers.map((member) => (
              <MemberRow key={member.id} member={member} status="accepted" />
            ))}

            {pendingMembers.map((member) => (
              <MemberRow key={member.id} member={member} status="pending" />
            ))}
          </div>
        </div>

        {canEdit ? (
          <InviteSetlistCollaboratorForm
            setlistId={setlistId}
            redirectTo={redirectTo}
            inviteOptions={inviteOptions}
            inviteSetlistCollaborator={inviteSetlistCollaborator}
          />
        ) : null}
      </div>
    </section>
  )
}

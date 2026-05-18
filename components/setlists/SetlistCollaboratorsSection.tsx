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

function MemberPill({
  member,
  status,
}: {
  member: SetlistMember
  status: "accepted" | "pending"
}) {
  const className =
    status === "accepted"
      ? "rounded-full border border-success bg-success px-3 py-1 text-sm font-medium text-success-foreground"
      : "rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-medium text-muted-foreground"

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
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Collaborators
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {acceptedMembers.map((member) => (
              <MemberPill key={member.id} member={member} status="accepted" />
            ))}

            {pendingMembers.map((member) => (
              <MemberPill key={member.id} member={member} status="pending" />
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
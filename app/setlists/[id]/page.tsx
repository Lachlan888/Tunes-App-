import Link from "next/link"
import AddTuneToSetlistModal from "@/components/setlists/AddTuneToSetlistModal"
import EditSetlistModal from "@/components/setlists/EditSetlistModal"
import InviteSetlistCollaboratorForm from "@/components/setlists/InviteSetlistCollaboratorForm"
import SetlistStatusMessages from "@/components/setlists/SetlistStatusMessages"
import SetlistTuneMatrix from "@/components/setlists/SetlistTuneMatrix"
import UserIdentityLink from "@/components/UserIdentityLink"
import { markAsKnown } from "@/lib/actions/known-pieces"
import {
  addTuneToSetlist,
  deleteSetlist,
  inviteSetlistCollaborator,
  moveSetlistItem,
  removeTuneFromSetlist,
  updateSetlist,
  updateSetlistItem,
} from "@/lib/actions/setlists"
import { removeFromPractice, startLearning } from "@/lib/actions/user-pieces"
import { loadSetlistDetailData } from "@/lib/loaders/setlists"

type SetlistDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{
    setlist?: string
    setlist_invite?: string
    setlist_item?: string
  }>
}

function pluralise(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function memberLabel(member: {
  profile: {
    username: string | null
    display_name: string | null
  } | null
}) {
  return member.profile?.display_name || member.profile?.username || "Unknown"
}

function MemberPill({
  member,
  status,
}: {
  member: {
    id: number
    profile: {
      username: string | null
      display_name: string | null
    } | null
  }
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

export default async function SetlistDetailPage({
  params,
  searchParams,
}: SetlistDetailPageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams

  const setlistStatus = resolvedSearchParams?.setlist ?? ""
  const inviteStatus = resolvedSearchParams?.setlist_invite ?? ""
  const itemStatus = resolvedSearchParams?.setlist_item ?? ""

  const {
    user,
    setlist,
    currentMembershipStatus,
    acceptedMembers,
    pendingMembers,
    inviteOptions,
    items,
    allPieces,
    redirectTo,
    summary,
  } = await loadSetlistDetailData(id)

  const canEdit = currentMembershipStatus === "accepted"

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <div className="mb-5">
        <Link
          href="/setlists"
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to Setlists
        </Link>
      </div>

      <header className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Setlist
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {setlist.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-muted-foreground">
              <span>{pluralise(summary.memberCount, "collaborator")}</span>
              <span aria-hidden="true">•</span>
              <span>{pluralise(summary.tuneCount, "tune")}</span>

              {setlist.event_date ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{setlist.event_date}</span>
                </>
              ) : null}

              {setlist.location ? (
                <>
                  <span aria-hidden="true">•</span>
                  <span>{setlist.location}</span>
                </>
              ) : null}
            </div>

            {setlist.description ? (
              <p className="mt-5 max-w-3xl text-base leading-7 text-foreground">
                {setlist.description}
              </p>
            ) : (
              <p className="mt-5 text-base text-muted-foreground">
                No description yet.
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                {pluralise(summary.tuneCount, "tune")}
              </span>

              <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                {pluralise(summary.memberCount, "collaborator")}
              </span>

              <span className="rounded-full border border-success bg-success px-3 py-1.5 text-sm font-medium text-success-foreground">
                {summary.knownByEveryoneCount} known by everyone
              </span>

              <span className="rounded-full border border-warning-strong bg-background/70 px-3 py-1.5 text-sm font-medium text-muted-foreground">
                {summary.gapTuneCount} with gaps
              </span>
            </div>
          </div>

          {canEdit ? (
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <AddTuneToSetlistModal
                setlistId={setlist.id}
                pieces={allPieces}
                existingPieceIds={items.map((item) => item.piece_id)}
                redirectTo={redirectTo}
                addTuneToSetlist={addTuneToSetlist}
              />

              <EditSetlistModal
                setlist={setlist}
                redirectTo={redirectTo}
                updateSetlist={updateSetlist}
                deleteSetlist={deleteSetlist}
              />
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-5">
        <SetlistStatusMessages
          setlistStatus={setlistStatus}
          inviteStatus={inviteStatus}
          itemStatus={itemStatus}
        />
      </div>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
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
              setlistId={setlist.id}
              redirectTo={redirectTo}
              inviteOptions={inviteOptions}
              inviteSetlistCollaborator={inviteSetlistCollaborator}
            />
          ) : null}
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Tunes and coverage
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Coverage comes from each collaborator’s Known and Practice state.
              Setlist membership itself does not make a tune known.
            </p>
          </div>

          {canEdit ? (
            <AddTuneToSetlistModal
              setlistId={setlist.id}
              pieces={allPieces}
              existingPieceIds={items.map((item) => item.piece_id)}
              redirectTo={redirectTo}
              addTuneToSetlist={addTuneToSetlist}
            />
          ) : null}
        </div>

        {items.length === 0 ? (
          <p className="rounded-2xl border border-border bg-background/70 p-5 text-sm text-muted-foreground">
            This setlist has no tunes yet.
          </p>
        ) : (
          <SetlistTuneMatrix
            currentUserId={user.id}
            members={acceptedMembers}
            items={items}
            canEdit={canEdit}
            redirectTo={redirectTo}
            startLearning={startLearning}
            markAsKnown={markAsKnown}
            removeFromPractice={removeFromPractice}
            moveSetlistItem={moveSetlistItem}
            removeTuneFromSetlist={removeTuneFromSetlist}
            updateSetlistItem={updateSetlistItem}
          />
        )}
      </section>
    </main>
  )
}
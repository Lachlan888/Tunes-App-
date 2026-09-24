import Link from "next/link"
import SetlistCollaboratorsSection from "@/components/setlists/SetlistCollaboratorsSection"
import SetlistHeader from "@/components/setlists/SetlistHeader"
import SetlistStatusMessages from "@/components/setlists/SetlistStatusMessages"
import SetlistSessionDock from "@/components/session-dock/SetlistSessionDock"
import SetlistReadView from "@/components/setlists/SetlistReadView"
import SetlistOrderManager from "@/components/setlists/SetlistOrderManager"
import PersonalReadinessStrip from "@/components/setlists/PersonalReadinessStrip"
import AddTuneToSetlistModal from "@/components/setlists/AddTuneToSetlistModal"
import EditSetlistModal from "@/components/setlists/EditSetlistModal"
import { addTuneToSetlist, deleteSetlist, inviteSetlistCollaborator, reorderSetlistItems, removeTuneFromSetlist, updateSetlist, updateSetlistItem } from "@/lib/actions/setlists"
import { loadSetlistDetailData } from "@/lib/loaders/setlists"
import { buildActiveSetlistPayload, parseSetlistMode } from "@/lib/setlist-performance"

export default async function SetlistDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ mode?: string; performance?: string; setlist?: string; setlist_invite?: string; setlist_item?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const { user, setlist, currentMembershipStatus, acceptedMembers, pendingMembers, inviteOptions, items, summary } = await loadSetlistDetailData(id)
  const canEdit = currentMembershipStatus === "accepted"
  const requestedMode = parseSetlistMode(query?.mode)
  const mode = requestedMode === "manage" && !canEdit ? "read" : requestedMode
  const redirectTo = `/setlists/${setlist.id}?mode=manage`
  if (mode === "performance") return <SetlistSessionDock payload={buildActiveSetlistPayload({ setlist, items })} userId={user.id} initialItemId={Number(query?.performance) || null} />

  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-foreground sm:px-6">
    <Link href="/setlists" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Back to Setlists</Link>
    <SetlistHeader setlist={setlist} members={acceptedMembers} tuneCount={items.length} />
    <nav aria-label="Setlist views" className="flex flex-wrap gap-2">
      {(["read", ...(canEdit ? ["manage"] : [])] as const).map(view => <Link key={view} href={`?mode=${view}`} aria-current={mode === view ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full border border-hairline px-5 text-sm font-semibold ${mode === view ? "bg-primary text-primary-foreground" : ""}`}>{view === "read" ? "Read" : "Manage"}</Link>)}
    </nav>
    <SetlistStatusMessages setlistStatus={query?.setlist ?? ""} inviteStatus={query?.setlist_invite ?? ""} itemStatus={query?.setlist_item ?? ""} />
    {requestedMode === "manage" && !canEdit ? <p role="status">Accept your invitation from Setlists before managing this set.</p> : null}
    <PersonalReadinessStrip ready={summary.readyCount} practice={summary.practiceCount} newToMe={summary.newToMeCount} />
    {mode === "manage" ? <div className="workbench-split">
      <section aria-label="Manage running order">
        <h2 className="text-xl font-semibold">Running order</h2>
        <SetlistOrderManager setlistId={setlist.id} currentUserId={user.id} initialItems={items} initialVersion={setlist.updated_at ?? setlist.created_at} redirectTo={redirectTo} reorderSetlistItems={reorderSetlistItems} removeTuneFromSetlist={removeTuneFromSetlist} updateSetlistItem={updateSetlistItem} />
      </section>
      <aside className="workbench-context space-y-5" aria-label="Set details and collaboration">
      <div className="flex flex-wrap gap-3">
        <AddTuneToSetlistModal setlistId={setlist.id} existingPieceIds={items.map(item => item.piece_id)} redirectTo={redirectTo} addTuneToSetlist={addTuneToSetlist} />
        <EditSetlistModal setlist={setlist} canDelete={setlist.created_by === user.id} redirectTo={redirectTo} updateSetlist={updateSetlist} deleteSetlist={deleteSetlist} />
      </div>
      <SetlistCollaboratorsSection setlistId={setlist.id} acceptedMembers={acceptedMembers} pendingMembers={pendingMembers} canEdit redirectTo={redirectTo} inviteOptions={inviteOptions} inviteSetlistCollaborator={inviteSetlistCollaborator} />
      </aside>
    </div> : <SetlistReadView currentUserId={user.id} items={items} />}
  </main>
}

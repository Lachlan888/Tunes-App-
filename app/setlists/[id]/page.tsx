import Link from "next/link"
import SetlistCollaboratorsSection from "@/components/setlists/SetlistCollaboratorsSection"
import SetlistCoverageSection from "@/components/setlists/SetlistCoverageSection"
import SetlistHeader from "@/components/setlists/SetlistHeader"
import SetlistStatusMessages from "@/components/setlists/SetlistStatusMessages"
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
  const existingPieceIds = items.map((item) => item.piece_id)

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

      <SetlistHeader
        setlist={setlist}
        summary={summary}
        canEdit={canEdit}
        allPieces={allPieces}
        existingPieceIds={existingPieceIds}
        redirectTo={redirectTo}
        addTuneToSetlist={addTuneToSetlist}
        updateSetlist={updateSetlist}
        deleteSetlist={deleteSetlist}
      />

      <div className="mt-5">
        <SetlistStatusMessages
          setlistStatus={setlistStatus}
          inviteStatus={inviteStatus}
          itemStatus={itemStatus}
        />
      </div>

      <div className="mt-8">
        <SetlistCollaboratorsSection
          setlistId={setlist.id}
          acceptedMembers={acceptedMembers}
          pendingMembers={pendingMembers}
          canEdit={canEdit}
          redirectTo={redirectTo}
          inviteOptions={inviteOptions}
          inviteSetlistCollaborator={inviteSetlistCollaborator}
        />
      </div>

      <div className="mt-8">
        <SetlistCoverageSection
          currentUserId={user.id}
          setlistId={setlist.id}
          acceptedMembers={acceptedMembers}
          items={items}
          allPieces={allPieces}
          canEdit={canEdit}
          redirectTo={redirectTo}
          addTuneToSetlist={addTuneToSetlist}
          startLearning={startLearning}
          markAsKnown={markAsKnown}
          removeFromPractice={removeFromPractice}
          moveSetlistItem={moveSetlistItem}
          removeTuneFromSetlist={removeTuneFromSetlist}
          updateSetlistItem={updateSetlistItem}
        />
      </div>
    </main>
  )
}
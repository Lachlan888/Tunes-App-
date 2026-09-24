"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import EditListModal from "@/components/lists/EditListModal"
import { buttonStyles } from "@/components/ui/buttonStyles"
import EditorialListCard from "@/components/lists/EditorialListCard"
import { learningListHref } from "@/lib/list-return"
import type { FilterableLearningList } from "@/lib/types"

type ListOverviewCardProps = {
  list: FilterableLearningList
  redirectTo: string
  updateList: (formData: FormData) => Promise<void>
  removeTuneFromList: (formData: FormData) => Promise<void>
  deleteList: (formData: FormData) => Promise<void>
}

export default function ListOverviewCard({
  list,
  redirectTo,
  updateList,
  removeTuneFromList,
  deleteList,
}: ListOverviewCardProps) {
  const visibilityLabel = list.visibility === "public" ? "Public" : "Private"
  const listHref = learningListHref(list.id, redirectTo)

  return (
    <EditorialListCard id={list.id} title={list.name} href={listHref}>
      <p className="text-sm font-semibold">Your {visibilityLabel.toLowerCase()} list{list.is_imported ? " · editable copy" : ""}</p>
      <p className="text-sm text-text-muted">{list.tuneCount} tunes{list.stylesPresent.length > 0 ? ` · ${list.stylesPresent.join(" · ")}` : ""}</p>
      {list.description && <p className="text-sm leading-6">{list.description}</p>}
      <div className="mt-auto flex flex-wrap gap-2">
        <PendingLinkButton href={listHref} label="Read the list" pendingLabel="Opening..." className={buttonStyles.primary} />
        <EditListModal listId={list.id} name={list.name} description={list.description} visibility={list.visibility} redirectTo={redirectTo} tunes={list.tunes} updateList={updateList} removeTuneFromList={removeTuneFromList} deleteList={deleteList} triggerLabel="Manage" triggerClassName={buttonStyles.secondary} />
      </div>
    </EditorialListCard>
  )
}

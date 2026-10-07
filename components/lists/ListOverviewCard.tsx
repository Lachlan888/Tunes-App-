"use client"

import EditorialListCard from "@/components/lists/EditorialListCard"
import ListOverviewActions from "@/components/lists/ListOverviewActions"
import PendingLinkButton from "@/components/PendingLinkButton"
import { buttonStyles } from "@/components/ui/buttonStyles"
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
      <p className="text-sm text-text-muted">{visibilityLabel}{list.is_imported ? " · Editable copy" : ""} · {list.tuneCount} tune{list.tuneCount === 1 ? "" : "s"}{list.stylesPresent.length > 0 ? ` · ${list.stylesPresent.join(" · ")}` : ""}</p>
      {list.description && <p className="text-sm leading-6">{list.description}</p>}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <PendingLinkButton href={listHref} label="Open" pendingLabel="Opening..." className={buttonStyles.primary} />
        <ListOverviewActions list={list} redirectTo={redirectTo} updateList={updateList} removeTuneFromList={removeTuneFromList} deleteList={deleteList} />
      </div>
    </EditorialListCard>
  )
}

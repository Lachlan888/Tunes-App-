"use client"

import { useState } from "react"
import EditListModal from "@/components/lists/EditListModal"
import ContextActionMenu from "@/components/ui/ContextActionMenu"
import type { FilterableLearningList } from "@/lib/types"

export default function ListOverviewActions({ list, redirectTo, updateList, removeTuneFromList, deleteList }: {
  list: FilterableLearningList
  redirectTo: string
  updateList: (formData: FormData) => Promise<void>
  removeTuneFromList: (formData: FormData) => Promise<void>
  deleteList: (formData: FormData) => Promise<void>
}) {
  const [manageOpen, setManageOpen] = useState(false)

  return <>
    <ContextActionMenu label={`More actions for list ${list.name}`} title={list.name} actions={[{ id: "manage", label: "Manage list", onSelect: () => setManageOpen(true), completionMessage: null }]} />
    <EditListModal listId={list.id} name={list.name} description={list.description} visibility={list.visibility} redirectTo={redirectTo} tunes={list.tunes} updateList={updateList} removeTuneFromList={removeTuneFromList} deleteList={deleteList} controlledOpen={manageOpen} onControlledClose={() => setManageOpen(false)} />
  </>
}

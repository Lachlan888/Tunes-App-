"use client"

import { useState } from "react"
import ResponsivePanels from "@/components/layout/ResponsivePanels"

export default function FriendsMobileSwitcher({ addFriendsContent, activityContent }: {
  addFriendsContent: React.ReactNode
  activityContent: React.ReactNode
}) {
  const [active, setActive] = useState<"add" | "activity">("add")
  return <ResponsivePanels label="Friends views" active={active} onChange={setActive} className="friends-workbench" panels={[
    { id: "add", label: "Add friends", content: addFriendsContent },
    { id: "activity", label: "Activity", content: activityContent },
  ]} />
}

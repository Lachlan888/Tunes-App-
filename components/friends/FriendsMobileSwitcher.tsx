"use client"

import { useState } from "react"
import { joinClasses } from "@/components/ui/buttonStyles"

type FriendsMobileTab = "add" | "activity"

type FriendsMobileSwitcherProps = {
  addFriendsContent: React.ReactNode
  activityContent: React.ReactNode
}

const tabs: { id: FriendsMobileTab; label: string }[] = [
  { id: "add", label: "Add friends" },
  { id: "activity", label: "Activity" },
]

export default function FriendsMobileSwitcher({
  addFriendsContent,
  activityContent,
}: FriendsMobileSwitcherProps) {
  const [activeTab, setActiveTab] = useState<FriendsMobileTab>("add")

  return (
    <div className="md:hidden">
      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="grid grid-cols-2 rounded-full border border-border bg-card-strong/70 p-1 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={joinClasses(
                  "rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3">
        {activeTab === "add" ? addFriendsContent : activityContent}
      </div>
    </div>
  )
}
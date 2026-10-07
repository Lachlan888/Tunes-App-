"use client"

import ContextActionMenu, { type ContextAction } from "@/components/ui/ContextActionMenu"
import { archiveNotification, markNotificationRead } from "@/lib/actions/activity-interactions"

export default function InboxItemActions({ id, href, isUnread, title }: { id: number; href: string; isUnread: boolean; title: string }) {
  const notificationData = () => {
    const data = new FormData()
    data.set("notification_id", String(id))
    return data
  }
  const actions: ContextAction[] = [
    { id: "open", label: "Open update", href },
    ...(isUnread ? [{ id: "read", label: "Mark read", onSelect: () => markNotificationRead(notificationData()) }] : []),
    { id: "archive", label: "Archive", destructive: true, onSelect: () => archiveNotification(notificationData()) },
  ]

  return <ContextActionMenu label={`More actions for ${title}`} title={title} actions={actions} />
}

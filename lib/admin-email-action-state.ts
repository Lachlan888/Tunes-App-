import type { AdminEmailBroadcastResult } from "@/lib/services/admin-email-broadcasts"

export type AdminEmailActionState = {
  status: "idle" | "success" | "error"
  operation: "test" | "broadcast" | null
  message: string | null
  broadcastId: string | null
  result: AdminEmailBroadcastResult | null
}

export const initialAdminEmailActionState: AdminEmailActionState = {
  status: "idle",
  operation: null,
  message: null,
  broadcastId: null,
  result: null,
}

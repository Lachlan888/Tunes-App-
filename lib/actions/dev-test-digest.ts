"use server"

import { requireAppAdmin } from "@/lib/auth/roles"
import { sendTestNotificationDigest } from "@/lib/services/notification-digests"

export type DevTestDigestState = {
  status: "idle" | "success" | "error"
  message: string | null
}

export const initialDevTestDigestState: DevTestDigestState = {
  status: "idle",
  message: null,
}

export async function sendCurrentUserTestDigest(
  previousState: DevTestDigestState
): Promise<DevTestDigestState> {
  void previousState
  const { user } = await requireAppAdmin()
  const result = await sendTestNotificationDigest(user.id)

  if (!result.ok) {
    return {
      status: "error",
      message: result.error ?? "The test digest could not be sent.",
    }
  }

  return {
    status: "success",
    message: `Test digest sent to ${result.email}.`,
  }
}

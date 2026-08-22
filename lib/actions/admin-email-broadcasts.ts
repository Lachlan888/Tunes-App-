"use server"

import { revalidatePath } from "next/cache"
import { requireAppAdmin } from "@/lib/auth/roles"
import {
  isValidBroadcastId,
  validateBroadcastInput,
} from "@/lib/services/admin-email-broadcast-logic"
import {
  sendAdminEmailBroadcast,
  sendAdminEmailTest,
  type AdminEmailBroadcastResult,
} from "@/lib/services/admin-email-broadcasts"

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

export async function sendAdminEmailAction(
  previousState: AdminEmailActionState,
  formData: FormData
): Promise<AdminEmailActionState> {
  void previousState
  const { user } = await requireAppAdmin()
  const intent = formData.get("intent")
  const validation = validateBroadcastInput(formData)

  if (!validation.ok) {
    return {
      ...initialAdminEmailActionState,
      status: "error",
      operation: intent === "broadcast" ? "broadcast" : "test",
      message: validation.error,
    }
  }

  if (intent === "test") {
    try {
      const result = await sendAdminEmailTest({
        adminUser: user,
        input: validation.value,
      })

      if (!result.ok) {
        return {
          ...initialAdminEmailActionState,
          status: "error",
          operation: "test",
          message: result.error,
        }
      }

      return {
        ...initialAdminEmailActionState,
        status: "success",
        operation: "test",
        message: `Test email sent to ${result.email}.`,
      }
    } catch (error) {
      console.error("Admin test email action failed:", {
        adminUserId: user.id,
        error: error instanceof Error ? error.message : "Unknown error",
      })
      return {
        ...initialAdminEmailActionState,
        status: "error",
        operation: "test",
        message: "The test email could not be sent. Check the server logs.",
      }
    }
  }

  if (intent !== "broadcast") {
    return {
      ...initialAdminEmailActionState,
      status: "error",
      message: "Choose a valid email action.",
    }
  }

  const broadcastIdValue = formData.get("broadcast_id")
  const broadcastId =
    typeof broadcastIdValue === "string" ? broadcastIdValue.trim() : ""

  if (!isValidBroadcastId(broadcastId)) {
    return {
      ...initialAdminEmailActionState,
      status: "error",
      operation: "broadcast",
      message: "The broadcast ID is invalid. Close the confirmation and try again.",
    }
  }

  try {
    const outcome = await sendAdminEmailBroadcast({
      broadcastId,
      createdByUserId: user.id,
      input: validation.value,
    })

    if (outcome.duplicate) {
      return {
        ...initialAdminEmailActionState,
        status: "error",
        operation: "broadcast",
        broadcastId,
        message: "This broadcast has already started and was not sent again.",
      }
    }

    revalidatePath("/dev")

    return {
      status: "success",
      operation: "broadcast",
      broadcastId,
      message: "Broadcast complete.",
      result: outcome.result,
    }
  } catch (error) {
    console.error("Admin email broadcast action failed:", {
      broadcastId,
      adminUserId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    })

    return {
      ...initialAdminEmailActionState,
      status: "error",
      operation: "broadcast",
      broadcastId,
      message: "The broadcast could not be completed. Check the server logs.",
    }
  }
}

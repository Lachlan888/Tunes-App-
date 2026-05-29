import { NextResponse } from "next/server"
import { processNotificationDigests } from "@/lib/services/notification-digests"

function getCronSecret() {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    throw new Error("Missing required server environment variable: CRON_SECRET")
  }

  return secret
}

function isAuthorized(request: Request) {
  const secret = getCronSecret()
  const authorization = request.headers.get("authorization")

  if (authorization === `Bearer ${secret}`) {
    return true
  }

  const url = new URL(request.url)
  return url.searchParams.get("secret") === secret
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const summary = await processNotificationDigests()
    return NextResponse.json(summary)
  } catch (error) {
    console.error("Notification digest cron route failed:", error)

    return NextResponse.json(
      {
        ok: false,
        error: "Notification digest processing failed.",
        usersChecked: 0,
        digestsSent: 0,
        skipped: 0,
        failed: 1,
      },
      { status: 500 }
    )
  }
}

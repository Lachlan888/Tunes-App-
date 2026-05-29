import { NextResponse } from "next/server"
import { sendTransactionalEmail } from "@/lib/services/email"

function getPublicEmailError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Email test failed"
}

export async function GET() {
  const recipient = process.env.EMAIL_TEST_RECIPIENT?.trim()

  if (!recipient) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing required email environment variable: EMAIL_TEST_RECIPIENT",
      },
      { status: 500 }
    )
  }

  try {
    const result = await sendTransactionalEmail({
      to: recipient,
      subject: "Tunes App email test",
      htmlContent:
        "<p>This is a transactional email test from Tunes App.</p>",
      textContent: "This is a transactional email test from Tunes App.",
    })

    return NextResponse.json({
      ok: true,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: getPublicEmailError(error),
      },
      { status: 500 }
    )
  }
}

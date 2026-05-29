import "server-only"

const BREVO_TRANSACTIONAL_EMAIL_URL = "https://api.brevo.com/v3/smtp/email"

export type TransactionalEmailRecipient =
  | string
  | {
      email: string
      name?: string
    }

export type SendTransactionalEmailInput = {
  to: TransactionalEmailRecipient | TransactionalEmailRecipient[]
  subject: string
  htmlContent: string
  textContent: string
}

type BrevoEmailRecipient = {
  email: string
  name?: string
}

type BrevoEmailSuccessResponse = {
  messageId?: string
  [key: string]: unknown
}

function getRequiredEmailEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required email environment variable: ${name}`)
  }

  return value
}

function normaliseRecipient(
  recipient: TransactionalEmailRecipient
): BrevoEmailRecipient {
  if (typeof recipient === "string") {
    return {
      email: recipient,
    }
  }

  return recipient
}

async function parseBrevoResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return (await response.json()) as unknown
  }

  return await response.text()
}

export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: SendTransactionalEmailInput) {
  const apiKey = getRequiredEmailEnv("BREVO_API_KEY")
  const senderEmail = getRequiredEmailEnv("BREVO_SENDER_EMAIL")
  const senderName = getRequiredEmailEnv("BREVO_SENDER_NAME")
  const recipients = (Array.isArray(to) ? to : [to]).map(normaliseRecipient)

  if (recipients.length === 0) {
    throw new Error("At least one email recipient is required")
  }

  const response = await fetch(BREVO_TRANSACTIONAL_EMAIL_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: recipients,
      subject,
      htmlContent,
      textContent,
    }),
  })

  const result = await parseBrevoResponse(response)

  if (!response.ok) {
    console.error("Brevo transactional email failed:", {
      status: response.status,
      statusText: response.statusText,
      result,
    })

    throw new Error(`Brevo transactional email failed with status ${response.status}`)
  }

  return result as BrevoEmailSuccessResponse
}

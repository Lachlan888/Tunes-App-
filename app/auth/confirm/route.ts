import { type EmailOtpType } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { getSafeInternalPath } from "@/lib/auth/redirects"
import { getSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

function getRedirectBaseUrl(request: NextRequest) {
  return getSiteUrl(request.nextUrl.origin)
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null
  const next = requestUrl.searchParams.get("next") ?? "/"
  const redirectBaseUrl = getRedirectBaseUrl(request)

  const safeNextPath = getSafeInternalPath(next, "/")

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      `${redirectBaseUrl}/login?auth=missing-confirmation-token`
    )
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })

  if (error) {
    return NextResponse.redirect(
      `${redirectBaseUrl}/login?auth=confirmation-error`
    )
  }

  return NextResponse.redirect(`${redirectBaseUrl}${safeNextPath}`)
}

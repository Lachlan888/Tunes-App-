import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getAuthReturnPath } from "./redirects"

/** The proxy overwrites this header with the current internal path. */
export async function redirectToLogin(): Promise<never> {
  const path = getAuthReturnPath((await headers()).get("x-tunes-return-path"), "/")
  redirect(`/login?next=${encodeURIComponent(path)}`)
}

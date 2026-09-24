import { redirect } from "next/navigation"
import { getOptionalUserContext } from "@/lib/auth/session"
import LoginForm from "@/components/auth/LoginForm"
import { getAuthReturnPath } from "@/lib/auth/redirects"

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[]
    mode?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const nextPath = getAuthReturnPath(getSingleValue(params?.next), "/")
  if (await getOptionalUserContext()) redirect(getAuthReturnPath(getSingleValue(params?.next), "/dashboard"))
  const initialMode =
    getSingleValue(params?.mode) === "signup" ? "signup" : "login"

  return <LoginForm initialMode={initialMode} nextPath={nextPath} />
}

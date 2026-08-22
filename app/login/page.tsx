import LoginForm from "@/components/auth/LoginForm"
import { getSafeInternalPath } from "@/lib/auth/redirects"

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
  const nextPath = getSafeInternalPath(getSingleValue(params?.next), "/")
  const initialMode =
    getSingleValue(params?.mode) === "signup" ? "signup" : "login"

  return <LoginForm initialMode={initialMode} nextPath={nextPath} />
}

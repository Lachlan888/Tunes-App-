import { createClient } from "@/lib/supabase/server"
import { updateProfile } from "@/lib/actions/profile"
import { redirect } from "next/navigation"

type Profile = {
  username: string
  display_name: string | null
}

type DashboardPageProps = {
  searchParams?: Promise<{
    error?: string
    saved?: string
    username?: string
    display_name?: string
  }>
}

function getErrorMessage(error?: string) {
  if (error === "username_taken") {
    return "That username is already taken."
  }

  if (error === "invalid_username") {
    return "Username must be 3–30 characters and use only letters, numbers, and underscores."
  }

  if (error === "save_failed") {
    return "Profile could not be saved. Please try again."
  }

  return null
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single()

  const typedProfile = profile as Profile | null
  const errorMessage = getErrorMessage(params?.error)

  const usernameValue = params?.username ?? typedProfile?.username ?? ""

  const displayNameValue =
    params?.display_name ?? typedProfile?.display_name ?? ""

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      <p className="mt-4 text-gray-600">You are logged in as {user.email}</p>

      <section className="mt-6 rounded border p-4">
        <h2 className="text-xl font-semibold">Profile details</h2>

        {params?.saved === "1" && (
          <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
            Profile saved.
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
            {errorMessage}
          </p>
        )}

        <form action={updateProfile} className="mt-4 space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Public username
            </label>
            <input
              id="username"
              name="username"
              defaultValue={usernameValue}
              className="w-full rounded border p-2"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              3–30 characters, letters, numbers, and underscores only.
            </p>
          </div>

          <div>
            <label
              htmlFor="display_name"
              className="mb-1 block text-sm font-medium"
            >
              Display name
            </label>
            <input
              id="display_name"
              name="display_name"
              defaultValue={displayNameValue}
              className="w-full rounded border p-2"
            />
          </div>

          <button type="submit" className="rounded bg-black px-4 py-2 text-white">
            Save profile
          </button>
        </form>
      </section>
    </main>
  )
}
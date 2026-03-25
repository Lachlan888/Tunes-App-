import { createClient } from "@/lib/supabase/server"
import { updateProfile } from "@/lib/actions/profile"
import { redirect } from "next/navigation"

type Profile = {
  username: string
  display_name: string | null
}

export default async function DashboardPage() {
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

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="mt-4 text-gray-600">You are logged in as {user.email}</p>

      <section className="mt-6 rounded border p-4">
        <h2 className="text-xl font-semibold">Profile</h2>

        <form action={updateProfile} className="mt-4 space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Public username
            </label>
            <input
              id="username"
              name="username"
              defaultValue={typedProfile?.username ?? ""}
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
              defaultValue={typedProfile?.display_name ?? ""}
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
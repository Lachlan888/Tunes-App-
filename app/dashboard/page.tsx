import ProfileDetailsSection from "@/components/profile/ProfileDetailsSection"
import UserInstrumentsSection from "@/components/profile/UserInstrumentsSection"
import { loadOwnProfileData } from "@/lib/loaders/profile"

type DashboardPageProps = {
  searchParams?: Promise<{
    error?: string
    saved?: string
    username?: string
    display_name?: string
    instrument_error?: string
    instrument_saved?: string
    instrument_removed?: string
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

function getInstrumentErrorMessage(error?: string) {
  if (error === "blank") {
    return "Instrument name cannot be blank."
  }

  if (error === "duplicate") {
    return "That instrument is already in your profile."
  }

  if (error === "missing") {
    return "Instrument could not be found."
  }

  if (error === "save_failed") {
    return "Instrument could not be saved. Please try again."
  }

  if (error === "delete_failed") {
    return "Instrument could not be removed. Please try again."
  }

  return null
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = searchParams ? await searchParams : undefined
  const { user, profile, instruments } = await loadOwnProfileData()

  const errorMessage = getErrorMessage(params?.error)
  const instrumentErrorMessage = getInstrumentErrorMessage(
    params?.instrument_error
  )

  const usernameValue = params?.username ?? profile?.username ?? ""
  const displayNameValue = params?.display_name ?? profile?.display_name ?? ""

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your identity, instruments, and public profile settings.
        </p>
      </header>

      <div className="space-y-6">
        <ProfileDetailsSection
          email={user.email}
          profile={profile}
          errorMessage={errorMessage}
          saved={params?.saved === "1"}
          usernameValue={usernameValue}
          displayNameValue={displayNameValue}
        />

        <UserInstrumentsSection
          instruments={instruments}
          instrumentErrorMessage={instrumentErrorMessage}
          instrumentSaved={params?.instrument_saved === "1"}
          instrumentRemoved={params?.instrument_removed === "1"}
        />
      </div>
    </main>
  )
}
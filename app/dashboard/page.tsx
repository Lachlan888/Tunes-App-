import ProfileEditor from "@/components/profile/ProfileEditor"
import { loadOwnProfileData } from "@/lib/loaders/profile"

type DashboardPageProps = {
  searchParams?: Promise<{
    error?: string
    saved?: string
    username?: string
    display_name?: string
    bio?: string
    show_identity?: string
    show_instruments?: string
    show_public_lists_on_profile?: string
    show_repertoire_summary?: string
    show_compare_discoverability?: string
    compare_requires_friend?: string
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

function getDraftBoolean(
  searchParamValue: string | undefined,
  fallback: boolean
) {
  if (searchParamValue === "true") {
    return true
  }

  if (searchParamValue === "false") {
    return false
  }

  return fallback
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
  const bioValue = params?.bio ?? profile?.bio ?? ""

  const showIdentityValue = getDraftBoolean(
    params?.show_identity,
    profile?.show_identity ?? true
  )
  const showInstrumentsValue = getDraftBoolean(
    params?.show_instruments,
    profile?.show_instruments ?? true
  )
  const showPublicListsOnProfileValue = getDraftBoolean(
    params?.show_public_lists_on_profile,
    profile?.show_public_lists_on_profile ?? true
  )
  const showRepertoireSummaryValue = getDraftBoolean(
    params?.show_repertoire_summary,
    profile?.show_repertoire_summary ?? false
  )
  const showCompareDiscoverabilityValue = getDraftBoolean(
    params?.show_compare_discoverability,
    profile?.show_compare_discoverability ?? true
  )
  const compareRequiresFriendValue = getDraftBoolean(
    params?.compare_requires_friend,
    profile?.compare_requires_friend ?? false
  )

  return (
    <main className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your identity, instruments, and public profile settings.
        </p>
      </header>

      <ProfileEditor
        email={user.email}
        profile={profile}
        instruments={instruments}
        errorMessage={errorMessage}
        saved={params?.saved === "1"}
        instrumentErrorMessage={instrumentErrorMessage}
        instrumentSaved={params?.instrument_saved === "1"}
        instrumentRemoved={params?.instrument_removed === "1"}
        initialUsername={usernameValue}
        initialDisplayName={displayNameValue}
        initialBio={bioValue}
        initialShowIdentity={showIdentityValue}
        initialShowInstruments={showInstrumentsValue}
        initialShowPublicListsOnProfile={showPublicListsOnProfileValue}
        initialShowRepertoireSummary={showRepertoireSummaryValue}
        initialShowCompareDiscoverability={showCompareDiscoverabilityValue}
        initialCompareRequiresFriend={compareRequiresFriendValue}
      />
    </main>
  )
}
import PageOptionsModal from "@/components/page-options/PageOptionsModal"
import ProfileEditor from "@/components/profile/ProfileEditor"
import { loadPagePreferences } from "@/lib/loaders/page-preferences"
import { loadOwnProfileData } from "@/lib/loaders/profile"
import { PROFILE_PAGE_OPTIONS_CONFIG } from "@/lib/page-options/configs"

type DashboardPageProps = {
  searchParams?: Promise<{
    saved?: string | string[]
    error?: string | string[]
    instrument_error?: string | string[]
    instrument_saved?: string | string[]
    instrument_removed?: string | string[]
    username?: string | string[]
    display_name?: string | string[]
    bio?: string | string[]
    show_identity?: string | string[]
    show_instruments?: string | string[]
    show_public_lists_on_profile?: string | string[]
    show_composed_tunes_on_profile?: string | string[]
    show_repertoire_summary?: string | string[]
    show_repertoire_to_friends?: string | string[]
    show_comment_activity?: string | string[]
    show_compare_discoverability?: string | string[]
    compare_requires_friend?: string | string[]
    practice_diary_enabled?: string | string[]
    communication_settings?: string | string[]
    page_options?: string | string[]
  }>
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getBooleanDraftValue(
  value: string | string[] | undefined,
  fallback: boolean
) {
  const resolved = getSingleValue(value)

  if (resolved === "true") {
    return true
  }

  if (resolved === "false") {
    return false
  }

  return fallback
}

function getProfileErrorMessage(error: string) {
  if (error === "invalid_username") {
    return "Username must be 3–30 characters and can only contain letters, numbers, and underscores."
  }

  if (error === "username_taken") {
    return "That username is already taken."
  }

  if (error === "save_failed") {
    return "Could not save profile. Please try again."
  }

  return null
}

function getInstrumentErrorMessage(error: string) {
  if (error === "blank") {
    return "Add an instrument name before saving."
  }

  if (error === "duplicate") {
    return "That instrument is already on your profile."
  }

  if (error === "missing") {
    return "Could not tell which instrument to remove."
  }

  if (error === "delete_failed") {
    return "Could not remove instrument. Please try again."
  }

  if (error === "save_failed") {
    return "Could not save instrument. Please try again."
  }

  return null
}

function getPageOptionsMessage(status: string) {
  if (status === "saved") return "Profile page options saved."
  if (status === "reset") return "Profile page options reset."
  if (status === "error") return "Could not save Profile page options."

  return null
}

function getCommunicationSettingsMessage(status: string) {
  if (status === "saved") {
    return {
      tone: "success" as const,
      text: "Communication settings saved.",
    }
  }

  if (status === "invalid_digest") {
    return {
      tone: "warning" as const,
      text: "Choose a valid digest frequency.",
    }
  }

  if (status === "error") {
    return {
      tone: "error" as const,
      text: "Could not save communication settings.",
    }
  }

  return null
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams
  const pagePreferences = await loadPagePreferences(
    PROFILE_PAGE_OPTIONS_CONFIG.pageKey
  )

  const showSection = (sectionId: string) =>
    pagePreferences.visibleSections[sectionId] ?? true

  const { user, profile, notificationPreferences, instruments } =
    await loadOwnProfileData()

  const saved = getSingleValue(resolvedSearchParams?.saved) === "1"
  const instrumentSaved =
    getSingleValue(resolvedSearchParams?.instrument_saved) === "1"
  const instrumentRemoved =
    getSingleValue(resolvedSearchParams?.instrument_removed) === "1"

  const errorMessage = getProfileErrorMessage(
    getSingleValue(resolvedSearchParams?.error)
  )

  const instrumentErrorMessage = getInstrumentErrorMessage(
    getSingleValue(resolvedSearchParams?.instrument_error)
  )

  const pageOptionsMessage = getPageOptionsMessage(
    getSingleValue(resolvedSearchParams?.page_options)
  )

  const communicationSettingsMessage = getCommunicationSettingsMessage(
    getSingleValue(resolvedSearchParams?.communication_settings)
  )

  const initialUsername =
    getSingleValue(resolvedSearchParams?.username) || profile?.username || ""

  const initialDisplayName =
    getSingleValue(resolvedSearchParams?.display_name) ||
    profile?.display_name ||
    ""

  const initialBio =
    getSingleValue(resolvedSearchParams?.bio) || profile?.bio || ""

  const initialShowIdentity = getBooleanDraftValue(
    resolvedSearchParams?.show_identity,
    profile?.show_identity ?? true
  )

  const initialShowInstruments = getBooleanDraftValue(
    resolvedSearchParams?.show_instruments,
    profile?.show_instruments ?? true
  )

  const initialShowPublicListsOnProfile = getBooleanDraftValue(
    resolvedSearchParams?.show_public_lists_on_profile,
    profile?.show_public_lists_on_profile ?? true
  )

  const initialShowComposedTunesOnProfile = getBooleanDraftValue(
    resolvedSearchParams?.show_composed_tunes_on_profile,
    profile?.show_composed_tunes_on_profile ?? true
  )

  const initialShowRepertoireSummary = getBooleanDraftValue(
    resolvedSearchParams?.show_repertoire_summary,
    profile?.show_repertoire_summary ?? false
  )

  const initialShowRepertoireToFriends = getBooleanDraftValue(
    resolvedSearchParams?.show_repertoire_to_friends,
    profile?.show_repertoire_to_friends ?? false
  )

  const initialShowCommentActivity = getBooleanDraftValue(
    resolvedSearchParams?.show_comment_activity,
    profile?.show_comment_activity ?? true
  )

  const initialShowCompareDiscoverability = getBooleanDraftValue(
    resolvedSearchParams?.show_compare_discoverability,
    profile?.show_compare_discoverability ?? true
  )

  const initialCompareRequiresFriend = getBooleanDraftValue(
    resolvedSearchParams?.compare_requires_friend,
    profile?.compare_requires_friend ?? false
  )

  const initialPracticeDiaryEnabled = getBooleanDraftValue(
    resolvedSearchParams?.practice_diary_enabled,
    profile?.practice_diary_enabled ?? false
  )

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      {pageOptionsMessage ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground shadow-sm">
          {pageOptionsMessage}
        </div>
      ) : null}

      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Profile
            </p>

            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Manage your profile
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Control your public identity, instruments, visibility, comparison
              settings, and optional practice diary.
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              Logged in as {user.email ?? "Unknown"}
            </p>
          </div>

          <PageOptionsModal
            config={PROFILE_PAGE_OPTIONS_CONFIG}
            preferences={pagePreferences}
            redirectTo="/dashboard"
          />
        </div>
      </section>

      {showSection("profile_editor") ? (
        <ProfileEditor
          email={user.email}
          profile={profile}
          notificationPreferences={notificationPreferences}
          communicationSettingsMessage={communicationSettingsMessage}
          instruments={instruments}
          errorMessage={errorMessage}
          saved={saved}
          instrumentErrorMessage={instrumentErrorMessage}
          instrumentSaved={instrumentSaved}
          instrumentRemoved={instrumentRemoved}
          initialUsername={initialUsername}
          initialDisplayName={initialDisplayName}
          initialBio={initialBio}
          initialShowIdentity={initialShowIdentity}
          initialShowInstruments={initialShowInstruments}
          initialShowPublicListsOnProfile={initialShowPublicListsOnProfile}
          initialShowComposedTunesOnProfile={initialShowComposedTunesOnProfile}
          initialShowRepertoireSummary={initialShowRepertoireSummary}
          initialShowRepertoireToFriends={initialShowRepertoireToFriends}
          initialShowCommentActivity={initialShowCommentActivity}
          initialShowCompareDiscoverability={initialShowCompareDiscoverability}
          initialCompareRequiresFriend={initialCompareRequiresFriend}
          initialPracticeDiaryEnabled={initialPracticeDiaryEnabled}
        />
      ) : null}
    </main>
  )
}

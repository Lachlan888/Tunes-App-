import ProfileEditor from "@/components/profile/ProfileEditor"
import { loadOwnProfileData } from "@/lib/loaders/profile"

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
    show_repertoire_summary?: string | string[]
    show_repertoire_to_friends?: string | string[]
    show_comment_activity?: string | string[]
    show_compare_discoverability?: string | string[]
    compare_requires_friend?: string | string[]
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

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams
  const { user, profile, instruments } = await loadOwnProfileData()

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

  return (
    <main className="mx-auto max-w-[1500px] px-6 py-8 text-foreground">
      <section className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Profile
        </p>

        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight md:text-5xl">
          Manage your profile
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
          Control your public identity, instruments, visibility, and comparison
          settings.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Logged in as {user.email ?? "Unknown"}
        </p>
      </section>

      <ProfileEditor
        email={user.email}
        profile={profile}
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
        initialShowRepertoireSummary={initialShowRepertoireSummary}
        initialShowRepertoireToFriends={initialShowRepertoireToFriends}
        initialShowCommentActivity={initialShowCommentActivity}
        initialShowCompareDiscoverability={initialShowCompareDiscoverability}
        initialCompareRequiresFriend={initialCompareRequiresFriend}
      />
    </main>
  )
}
"use client"

import PendingLinkButton from "@/components/PendingLinkButton"
import SubmitButton from "@/components/SubmitButton"
import ProfileVisibilitySection from "@/components/profile/ProfileVisibilitySection"
import { updateProfile } from "@/lib/actions/profile"
import type { Profile } from "@/lib/types"

type ProfileDetailsSectionProps = {
  email: string | null
  profile: Profile | null
  errorMessage: string | null
  saved: boolean
  username: string
  setUsername: (value: string) => void
  displayName: string
  setDisplayName: (value: string) => void
  bio: string
  setBio: (value: string) => void
  showIdentity: boolean
  setShowIdentity: (value: boolean) => void
  showInstruments: boolean
  setShowInstruments: (value: boolean) => void
  showPublicListsOnProfile: boolean
  setShowPublicListsOnProfile: (value: boolean) => void
  showRepertoireSummary: boolean
  setShowRepertoireSummary: (value: boolean) => void
  showRepertoireToFriends: boolean
  setShowRepertoireToFriends: (value: boolean) => void
  showCommentActivity: boolean
  setShowCommentActivity: (value: boolean) => void
  showCompareDiscoverability: boolean
  setShowCompareDiscoverability: (value: boolean) => void
  compareRequiresFriend: boolean
  setCompareRequiresFriend: (value: boolean) => void
  practiceDiaryEnabled: boolean
  setPracticeDiaryEnabled: (value: boolean) => void
}

const inputClassName =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-[var(--focus-ring)]"

const labelClassName =
  "mb-2 block text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground"

const primaryButtonClassName =
  "rounded-full border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-70"

const secondaryButtonClassName =
  "inline-flex rounded-full border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"

export default function ProfileDetailsSection({
  email,
  profile,
  errorMessage,
  saved,
  username,
  setUsername,
  displayName,
  setDisplayName,
  bio,
  setBio,
  showIdentity,
  setShowIdentity,
  showInstruments,
  setShowInstruments,
  showPublicListsOnProfile,
  setShowPublicListsOnProfile,
  showRepertoireSummary,
  setShowRepertoireSummary,
  showRepertoireToFriends,
  setShowRepertoireToFriends,
  showCommentActivity,
  setShowCommentActivity,
  showCompareDiscoverability,
  setShowCompareDiscoverability,
  compareRequiresFriend,
  setCompareRequiresFriend,
  practiceDiaryEnabled,
  setPracticeDiaryEnabled,
}: ProfileDetailsSectionProps) {
  const publicProfileHref =
    username.trim() !== ""
      ? `/users/${encodeURIComponent(username.trim().toLowerCase())}`
      : null

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Profile details
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Manage how your identity appears around the app, whether your
            profile can be compared, and whether your optional practice diary is
            enabled.
          </p>

          <p className="mt-4 rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {email ?? "Unknown"}
            </span>
          </p>
        </div>

        {publicProfileHref && (
          <PendingLinkButton
            href={publicProfileHref}
            label="View public profile"
            pendingLabel="Opening..."
            className={secondaryButtonClassName}
          />
        )}
      </div>

      {saved && (
        <p className="mt-5 rounded-2xl border border-success bg-muted p-4 text-sm font-medium text-foreground shadow-sm">
          Profile saved.
        </p>
      )}

      {errorMessage && (
        <p className="mt-5 rounded-2xl border border-destructive bg-muted p-4 text-sm font-medium text-destructive shadow-sm">
          {errorMessage}
        </p>
      )}

      <form action={updateProfile} className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="username" className={labelClassName}>
              Public username
            </label>

            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={inputClassName}
              required
            />

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              3–30 characters, letters, numbers, and underscores only.
            </p>
          </div>

          <div>
            <label htmlFor="display_name" className={labelClassName}>
              Display name
            </label>

            <input
              id="display_name"
              name="display_name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className={inputClassName}
              placeholder="How other users should see your name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className={labelClassName}>
            Bio
          </label>

          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className={inputClassName}
            placeholder="Tell other users a little about yourself"
          />
        </div>

        <ProfileVisibilitySection
          profile={profile}
          showIdentity={showIdentity}
          setShowIdentity={setShowIdentity}
          showInstruments={showInstruments}
          setShowInstruments={setShowInstruments}
          showPublicListsOnProfile={showPublicListsOnProfile}
          setShowPublicListsOnProfile={setShowPublicListsOnProfile}
          showRepertoireSummary={showRepertoireSummary}
          setShowRepertoireSummary={setShowRepertoireSummary}
          showRepertoireToFriends={showRepertoireToFriends}
          setShowRepertoireToFriends={setShowRepertoireToFriends}
          showCommentActivity={showCommentActivity}
          setShowCommentActivity={setShowCommentActivity}
          showCompareDiscoverability={showCompareDiscoverability}
          setShowCompareDiscoverability={setShowCompareDiscoverability}
          compareRequiresFriend={compareRequiresFriend}
          setCompareRequiresFriend={setCompareRequiresFriend}
          practiceDiaryEnabled={practiceDiaryEnabled}
          setPracticeDiaryEnabled={setPracticeDiaryEnabled}
        />

        <SubmitButton
          label="Save profile"
          pendingLabel="Saving..."
          className={primaryButtonClassName}
        />
      </form>
    </section>
  )
}
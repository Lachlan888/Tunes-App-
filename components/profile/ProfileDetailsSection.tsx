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
  showCompareDiscoverability: boolean
  setShowCompareDiscoverability: (value: boolean) => void
  compareRequiresFriend: boolean
  setCompareRequiresFriend: (value: boolean) => void
}

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
  showCompareDiscoverability,
  setShowCompareDiscoverability,
  compareRequiresFriend,
  setCompareRequiresFriend,
}: ProfileDetailsSectionProps) {
  const publicProfileHref =
    username.trim() !== ""
      ? `/users/${encodeURIComponent(username.trim().toLowerCase())}`
      : null

  return (
    <section className="rounded border p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Profile details</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage how your identity appears around the app and on your public
            profile.
          </p>
          <p className="mt-3 text-sm text-gray-700">
            Signed in as <span className="font-medium">{email ?? "Unknown"}</span>
          </p>
        </div>

        {publicProfileHref && (
          <PendingLinkButton
            href={publicProfileHref}
            label="View public profile"
            pendingLabel="Opening..."
            className="inline-flex rounded border px-4 py-2 text-sm font-medium"
          />
        )}
      </div>

      {saved && (
        <p className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
          Profile saved.
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
          {errorMessage}
        </p>
      )}

      <form action={updateProfile} className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              Public username
            </label>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
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
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded border p-2"
              placeholder="How other users should see your name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="mb-1 block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            className="w-full rounded border p-2"
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
          showCompareDiscoverability={showCompareDiscoverability}
          setShowCompareDiscoverability={setShowCompareDiscoverability}
          compareRequiresFriend={compareRequiresFriend}
          setCompareRequiresFriend={setCompareRequiresFriend}
        />

        <SubmitButton
          label="Save profile"
          pendingLabel="Saving..."
          className="rounded bg-black px-4 py-2 text-white"
        />
      </form>
    </section>
  )
}
"use client"

import type { Profile } from "@/lib/types"

type ProfileVisibilitySectionProps = {
  profile: Profile | null
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

export default function ProfileVisibilitySection({
  profile,
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
}: ProfileVisibilitySectionProps) {
  return (
    <div className="rounded border p-4">
      <h3 className="text-lg font-semibold">Public profile settings</h3>
      <p className="mt-1 text-sm text-gray-600">
        Control what other users can see on your public profile and whether they
        can compare with you.
      </p>

      <div className="mt-4 space-y-4">
        <label className="block rounded border p-3">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_identity"
              checked={showIdentity}
              onChange={(event) => setShowIdentity(event.target.checked)}
            />
            <span className="font-medium">Show identity</span>
          </span>
          <p className="mt-1 text-sm text-gray-600">
            Show your display name, username, and bio on your public profile.
          </p>
        </label>

        <label className="block rounded border p-3">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_instruments"
              checked={showInstruments}
              onChange={(event) => setShowInstruments(event.target.checked)}
            />
            <span className="font-medium">Show instruments</span>
          </span>
          <p className="mt-1 text-sm text-gray-600">
            Let other users see the instruments listed on your profile.
          </p>
        </label>

        <label className="block rounded border p-3">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_public_lists_on_profile"
              checked={showPublicListsOnProfile}
              onChange={(event) =>
                setShowPublicListsOnProfile(event.target.checked)
              }
            />
            <span className="font-medium">Show public lists</span>
          </span>
          <p className="mt-1 text-sm text-gray-600">
            Display your public tune lists on your profile page.
          </p>
        </label>

        <label className="block rounded border p-3">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_repertoire_summary"
              checked={showRepertoireSummary}
              onChange={(event) =>
                setShowRepertoireSummary(event.target.checked)
              }
            />
            <span className="font-medium">Show repertoire summary</span>
          </span>
          <p className="mt-1 text-sm text-gray-600">
            Show counts for known tunes and tunes currently in practice.
          </p>
        </label>

        <label className="block rounded border p-3">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              name="show_compare_discoverability"
              checked={showCompareDiscoverability}
              onChange={(event) =>
                setShowCompareDiscoverability(event.target.checked)
              }
            />
            <span className="font-medium">Allow compare discovery</span>
          </span>
          <p className="mt-1 text-sm text-gray-600">
            Let other users find and compare with your profile.
          </p>
        </label>

        <label className="block rounded border p-3">
          <span className="flex items-center gap-2">
            <input
              type="checkbox"
              name="compare_requires_friend"
              checked={compareRequiresFriend}
              onChange={(event) =>
                setCompareRequiresFriend(event.target.checked)
              }
            />
            <span className="font-medium">Require friendship for compare</span>
          </span>
          <p className="mt-1 text-sm text-gray-600">
            If enabled, users must be friends with you before they can compare.
          </p>
        </label>
      </div>

      {profile === null && (
        <p className="mt-3 text-sm text-gray-600">
          These settings will be saved when you save your profile.
        </p>
      )}
    </div>
  )
}